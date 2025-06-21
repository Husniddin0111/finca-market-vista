
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
  };
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface LinkedRecord {
  id: string;
  fields: {
    Name: string;
  };
}

export interface LinkedRecordResponse {
  records: LinkedRecord[];
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
}

export class AirtableService {
  private baseUrl: string = 'https://api.airtable.com/v0/appnc5K3ijuJIrNqn';
  private apiKey: string = 'patlA5ApKpEDGVeWJ.a75203c8e393a2a95b4ef847004d1bbd700fc189f8b9f8e6a2474e7d4bbcca18';

  private async fetchFromAirtable(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
      
      // Resolve linked records for each stock record
      const recordsWithResolvedLinks = await Promise.all(
        response.records.map(async (record: AirtableRecord) => {
          const resolvedFields = { ...record.fields };

          // Resolve suppliers (from suppliers table)
          if (record.fields.suppliers && Array.isArray(record.fields.suppliers) && record.fields.suppliers.length > 0) {
            console.log('Resolving suppliers:', record.fields.suppliers);
            const supplierNames = await this.resolveLinkedRecords(record.fields.suppliers, 'suppliers');
            console.log('Resolved supplier names:', supplierNames);
            resolvedFields.suppliers = supplierNames;
          }

          // Resolve variety (from coffee_type table)
          if (record.fields.variety && Array.isArray(record.fields.variety) && record.fields.variety.length > 0) {
            console.log('Resolving variety:', record.fields.variety);
            const varietyNames = await this.resolveLinkedRecords(record.fields.variety, 'coffee_type');
            console.log('Resolved variety names:', varietyNames);
            resolvedFields.variety = varietyNames;
          }

          // Resolve process (from process table)
          if (record.fields.process && Array.isArray(record.fields.process) && record.fields.process.length > 0) {
            console.log('Resolving process:', record.fields.process);
            const processNames = await this.resolveLinkedRecords(record.fields.process, 'process');
            console.log('Resolved process names:', processNames);
            resolvedFields.process = processNames;
          }

          // Resolve origin
          if (record.fields.origin && Array.isArray(record.fields.origin) && record.fields.origin.length > 0) {
            console.log('Resolving origin:', record.fields.origin);
            const originNames = await this.resolveLinkedRecords(record.fields.origin, 'origin');
            console.log('Resolved origin names:', originNames);
            resolvedFields.origin = originNames;
          }

          // Resolve flavors (from flavors table)
          if (record.fields.flavors && Array.isArray(record.fields.flavors) && record.fields.flavors.length > 0) {
            console.log('Resolving flavors:', record.fields.flavors);
            const flavorNames = await this.resolveLinkedRecords(record.fields.flavors, 'flavors');
            console.log('Resolved flavor names:', flavorNames);
            resolvedFields.flavors = flavorNames;
          }

          return {
            ...record,
            fields: resolvedFields
          };
        })
      );

      console.log('Records with resolved links:', recordsWithResolvedLinks);

      return {
        ...response,
        records: recordsWithResolvedLinks
      };
    } catch (error) {
      console.error('Error fetching Airtable data:', error);
      throw error;
    }
  }

  private async resolveLinkedRecords(recordIds: string[], tableName: string): Promise<string[]> {
    try {
      console.log(`Resolving linked records for table ${tableName} with IDs:`, recordIds);
      
      // Build filter formula to get specific records
      const filterFormula = `OR(${recordIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
      const params = new URLSearchParams();
      params.append('filterByFormula', filterFormula);
      params.append('fields[]', 'Name');

      console.log(`Making request to /${tableName} with filter:`, filterFormula);
      const response = await this.fetchFromAirtable(`/${tableName}?${params}`);
      console.log(`Response from ${tableName}:`, response);
      
      // Extract names from the response
      const names = response.records.map((record: LinkedRecord) => {
        console.log(`Record from ${tableName}:`, record);
        return record.fields.Name || 'Unknown';
      });
      
      console.log(`Resolved names for ${tableName}:`, names);
      return names;
    } catch (error) {
      console.error(`Error resolving linked records for table ${tableName}:`, error);
      // Return original IDs as fallback
      return recordIds;
    }
  }

  transformRecord(record: AirtableRecord): TransformedCoffeeRecord {
    console.log('Transforming record:', record);
    
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
      status: record.fields.is_ready ? 'Sample requested' : 'Request Samples'
    };
    
    console.log('Transformed record:', transformed);
    return transformed;
  }

  // Standalone function for fetching stock records with resolved linked fields
  async fetchStockRecordsWithLinkedData(): Promise<TransformedCoffeeRecord[]> {
    try {
      console.log('Fetching stock records with linked data...');
      const response = await this.fetchRecords();
      console.log('Raw response with resolved links:', response);
      
      const transformedRecords = response.records.map(record => this.transformRecord(record));
      console.log('Final transformed records:', transformedRecords);
      
      return transformedRecords;
    } catch (error) {
      console.error('Error in fetchStockRecordsWithLinkedData:', error);
      throw error;
    }
  }
}
