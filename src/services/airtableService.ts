export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    Code?: string;
    suppliers?: string[];
    flavors?: string[];
    'farmer minimum'?: number;
    'real min'?: number;
    'real minimum'?: number;
    process?: string[];
    variety?: string[];
    stock_kg?: number;
    scaa?: number;
    'Price FOB/lb'?: number;
    'fair split'?: number;
    'farmer gets'?: number;
    'we get'?: number;
    'buyer gets'?: number;
    is_ready?: boolean;
    origin?: string[];
    varietyImages?: string[];
  };
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface LinkedRecord {
  id: string;
  fields: {
    Name?: string;
    variety?: string;
    title?: string;
    first_name?: string;
    last_name?: string;
    farm?: string;
    image?: Array<{
      id: string;
      url: string;
      filename: string;
    }>;
  };
}

export interface TransformedCoffeeRecord {
  id: string;
  variety: string;
  process: string;
  scaa: number;
  origin: string;
  farm: string;
  flavorsNotes: string;
  stockKg: number;
  price: number;
  status: string;
  imageUrl?: string;
}

export class AirtableService {
  private baseUrl: string = 'https://api.airtable.com/v0/appnc5K3ijuJIrNqn';
  private apiKey: string = 'patlA5ApKpEDGVeWJ.a75203c8e393a2a95b4ef847004d1bbd700fc189f8b9f8e6a2474e7d4bbcca18';
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private async fetchFromAirtable(endpoint: string): Promise<any> {
    const cacheKey = endpoint;
    
    if (this.isValidCache(cacheKey)) {
      console.log(`Cache hit for: ${endpoint}`);
      return this.cache.get(cacheKey);
    }

    console.log(`Making request to: ${this.baseUrl}${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    console.log(`Response cached for: ${endpoint}`);
    return data;
  }

  async fetchRecords(offset?: string, pageSize: number = 100): Promise<AirtableResponse> {
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
    });

    if (offset) {
      params.append('offset', offset);
    }

    try {
      const response = await this.fetchFromAirtable(`/stock?${params}`);
      console.log('Raw Airtable response:', response);
      
      // First, fetch all coffee_type records to create a mapping
      const coffeeTypes = await this.fetchAllCoffeeTypes();
      console.log('📸 Coffee types with images:', coffeeTypes);
      
      // Batch resolve linked records for better performance
      const recordsWithResolvedLinks = await Promise.all(
        response.records.map(async (record: AirtableRecord) => {
          const resolvedFields = { ...record.fields };

          // Resolve all linked records in parallel
          const [suppliers, varieties, processes, origins, flavors] = await Promise.all([
            this.resolveLinkedRecordsBatch(record.fields.suppliers, 'suppliers'),
            this.resolveLinkedRecordsBatch(record.fields.variety, 'coffee_type'),
            this.resolveLinkedRecordsBatch(record.fields.process, 'process'),
            this.resolveLinkedRecordsBatch(record.fields.origin, 'origin'),
            this.resolveLinkedRecordsBatch(record.fields.flavors, 'flavors')
          ]);

          if (suppliers.length > 0) resolvedFields.suppliers = suppliers.map(s => s.name);
          if (varieties.length > 0) {
            resolvedFields.variety = varieties.map(v => v.name);
            
            // Match variety names with coffee_type table to get images
            const varietyImages: string[] = [];
            varieties.forEach(variety => {
              const matchingCoffeeType = coffeeTypes.find(ct => 
                ct.variety.toLowerCase().trim() === variety.name.toLowerCase().trim()
              );
              if (matchingCoffeeType && matchingCoffeeType.imageUrl) {
                varietyImages.push(matchingCoffeeType.imageUrl);
                console.log(`🎯 MATCHED ${variety.name} with image: ${matchingCoffeeType.imageUrl}`);
              } else {
                console.log(`❌ NO MATCH found for variety: ${variety.name}`);
                console.log('Available coffee types:', coffeeTypes.map(ct => ct.variety));
              }
            });
            
            resolvedFields.varietyImages = varietyImages;
          }
          if (processes.length > 0) resolvedFields.process = processes.map(p => p.name);
          if (origins.length > 0) resolvedFields.origin = origins.map(o => o.name);
          if (flavors.length > 0) resolvedFields.flavors = flavors.map(f => f.name);

          return {
            ...record,
            fields: resolvedFields
          };
        })
      );

      return {
        ...response,
        records: recordsWithResolvedLinks
      };
    } catch (error) {
      console.error('Error fetching Airtable data:', error);
      throw error;
    }
  }

  private async fetchAllCoffeeTypes(): Promise<Array<{variety: string, imageUrl: string}>> {
    try {
      const cacheKey = 'all-coffee-types';
      
      if (this.isValidCache(cacheKey)) {
        console.log('Cache hit for coffee types');
        return this.cache.get(cacheKey);
      }

      console.log('🔍 Fetching all coffee_type records...');
      const response = await this.fetchFromAirtable('/coffee_type');
      console.log('Coffee_type response:', response);
      
      const coffeeTypes = response.records.map((record: any) => {
        const variety = record.fields?.variety || 'Unknown';
        let imageUrl = '';
        
        if (record.fields?.image && Array.isArray(record.fields.image) && record.fields.image.length > 0) {
          imageUrl = record.fields.image[0].url;
        }
        
        console.log(`Coffee type: ${variety}, Image: ${imageUrl}`);
        return { variety, imageUrl };
      });
      
      this.setCache(cacheKey, coffeeTypes);
      return coffeeTypes;
    } catch (error) {
      console.error('Error fetching coffee types:', error);
      return [];
    }
  }

  private async resolveLinkedRecordsBatch(recordIds: string[] | undefined, tableName: string): Promise<Array<{name: string, imageUrl?: string}>> {
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      console.log(`No linked records found for table: ${tableName}`);
      return [];
    }

    console.log(`Resolving ${recordIds.length} linked records for table: ${tableName}`, recordIds);

    try {
      const results = await Promise.all(
        recordIds.map(async (recordId) => {
          const cacheKey = `${tableName}/${recordId}`;
          
          if (this.isValidCache(cacheKey)) {
            console.log(`Cache hit for ${tableName}/${recordId}`);
            return this.cache.get(cacheKey);
          }

          try {
            console.log(`Fetching linked record: ${tableName}/${recordId}`);
            const response = await this.fetchFromAirtable(`/${tableName}/${recordId}`);
            console.log(`Response for ${tableName}/${recordId}:`, response);
            
            let name = '';
            let imageUrl = '';
            
            switch (tableName) {
              case 'coffee_type':
                name = response.fields?.variety || `Unknown-${recordId}`;
                // Get image from coffee_type table - this is the key fix
                if (response.fields?.image && Array.isArray(response.fields.image) && response.fields.image.length > 0) {
                  imageUrl = response.fields.image[0].url;
                  console.log(`✅ FOUND IMAGE for ${name}: ${imageUrl}`);
                } else {
                  console.log(`❌ NO IMAGE found for ${name} in coffee_type record. Fields:`, response.fields);
                  // Let's check what fields are available
                  console.log(`Available fields in coffee_type record:`, Object.keys(response.fields || {}));
                }
                break;
              case 'process':
                name = response.fields?.title || `Unknown-${recordId}`;
                break;
              case 'suppliers':
                const firstName = response.fields?.first_name || '';
                const lastName = response.fields?.last_name || '';
                const farmName = response.fields?.farm || '';
                name = farmName || `${firstName} ${lastName}`.trim() || `Unknown-${recordId}`;
                break;
              case 'flavors':
                name = response.fields?.title || `Unknown-${recordId}`;
                break;
              case 'origin':
                name = response.fields?.title || `Unknown-${recordId}`;
                break;
              default:
                name = response.fields?.Name || `Unknown-${recordId}`;
            }
            
            const result = { name, imageUrl };
            console.log(`Final result for ${tableName}/${recordId}:`, result);
            this.setCache(cacheKey, result);
            return result;
          } catch (recordError) {
            console.error(`Error fetching record ${recordId} from ${tableName}:`, recordError);
            return { name: `Error-${recordId}`, imageUrl: '' };
          }
        })
      );

      console.log(`Final results for ${tableName}:`, results);
      return results;
    } catch (error) {
      console.error(`Error resolving linked records for table ${tableName}:`, error);
      return recordIds.map(id => ({ name: id, imageUrl: '' }));
    }
  }

  transformRecord(record: AirtableRecord): TransformedCoffeeRecord {
    console.log(`Transforming record ${record.id} with resolved fields:`, record);
    
    const transformed = {
      id: record.id,
      variety: Array.isArray(record.fields.variety) ? record.fields.variety[0] || 'N/A' : 'N/A',
      process: Array.isArray(record.fields.process) ? record.fields.process[0] || 'N/A' : 'N/A',
      scaa: record.fields.scaa || 0,
      origin: Array.isArray(record.fields.origin) ? record.fields.origin[0] || 'N/A' : 'N/A',
      farm: Array.isArray(record.fields.suppliers) ? record.fields.suppliers[0] || 'N/A' : 'N/A',
      flavorsNotes: Array.isArray(record.fields.flavors) ? record.fields.flavors.join(', ') : 'N/A',
      stockKg: record.fields.stock_kg || 0,
      price: record.fields['Price FOB/lb'] || 0,
      status: record.fields.is_ready ? 'Sample requested' : 'Request Samples',
      imageUrl: record.fields.varietyImages?.[0] || ''
    };
    
    console.log(`Final transformed record for UI (ID: ${record.id}):`, transformed);
    
    // Special logging for debugging
    if (record.id === 'recaZzHjYaaFT3Lx9' || record.id === 'rec5K2yHfc3O3d82x') {
      console.log(`🔍 PRODUCT DEBUG - ${record.id}:`);
      console.log('Raw variety field:', record.fields.variety);
      console.log('Raw varietyImages field:', record.fields.varietyImages);
      console.log('Final imageUrl:', transformed.imageUrl);
      console.log('All record fields:', record.fields);
    }
    
    return transformed;
  }

  async fetchStockRecordsWithLinkedData(): Promise<TransformedCoffeeRecord[]> {
    try {
      console.log('🚀 Starting fetchStockRecordsWithLinkedData...');
      const response = await this.fetchRecords();
      console.log('📊 Raw response with resolved links:', response);
      
      const transformedRecords = response.records.map(record => this.transformRecord(record));
      console.log('✅ Final transformed records for UI:', transformedRecords);
      
      return transformedRecords;
    } catch (error) {
      console.error('❌ Error in fetchStockRecordsWithLinkedData:', error);
      throw error;
    }
  }
}
