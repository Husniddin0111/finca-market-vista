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
            resolvedFields.varietyImages = varieties.map(v => v.imageUrl).filter(Boolean);
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

  private async resolveLinkedRecordsBatch(recordIds: string[] | undefined, tableName: string): Promise<Array<{name: string, imageUrl?: string}>> {
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return [];
    }

    try {
      const results = await Promise.all(
        recordIds.map(async (recordId) => {
          const cacheKey = `${tableName}/${recordId}`;
          
          if (this.isValidCache(cacheKey)) {
            return this.cache.get(cacheKey);
          }

          try {
            const response = await this.fetchFromAirtable(`/${tableName}/${recordId}`);
            
            let name = '';
            let imageUrl = '';
            
            switch (tableName) {
              case 'coffee_type':
                name = response.fields?.variety || `Unknown-${recordId}`;
                // Get image from coffee_type table
                if (response.fields?.image && Array.isArray(response.fields.image) && response.fields.image.length > 0) {
                  imageUrl = response.fields.image[0].url;
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
            this.setCache(cacheKey, result);
            return result;
          } catch (recordError) {
            console.error(`Error fetching record ${recordId} from ${tableName}:`, recordError);
            return { name: `Error-${recordId}`, imageUrl: '' };
          }
        })
      );

      return results;
    } catch (error) {
      console.error(`Error resolving linked records for table ${tableName}:`, error);
      return recordIds.map(id => ({ name: id, imageUrl: '' }));
    }
  }

  transformRecord(record: AirtableRecord): TransformedCoffeeRecord {
    console.log('Transforming record with resolved fields:', record);
    
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
    
    console.log('Final transformed record for UI:', transformed);
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
