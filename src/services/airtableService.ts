
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
      
      // Resolve linked records for each stock record
      const recordsWithResolvedLinks = await Promise.all(
        response.records.map(async (record: AirtableRecord) => {
          const resolvedFields = { ...record.fields };

          // Resolve suppliers
          if (record.fields.suppliers && record.fields.suppliers.length > 0) {
            const supplierNames = await this.resolveLinkedRecords(record.fields.suppliers, 'suppliers');
            resolvedFields.suppliers = supplierNames;
          }

          // Resolve variety
          if (record.fields.variety && record.fields.variety.length > 0) {
            const varietyNames = await this.resolveLinkedRecords(record.fields.variety, 'variety');
            resolvedFields.variety = varietyNames;
          }

          // Resolve process
          if (record.fields.process && record.fields.process.length > 0) {
            const processNames = await this.resolveLinkedRecords(record.fields.process, 'process');
            resolvedFields.process = processNames;
          }

          // Resolve origin
          if (record.fields.origin && record.fields.origin.length > 0) {
            const originNames = await this.resolveLinkedRecords(record.fields.origin, 'origin');
            resolvedFields.origin = originNames;
          }

          // Resolve flavors
          if (record.fields.flavors && record.fields.flavors.length > 0) {
            const flavorNames = await this.resolveLinkedRecords(record.fields.flavors, 'flavors');
            resolvedFields.flavors = flavorNames;
          }

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

  private async resolveLinkedRecords(recordIds: string[], tableName: string): Promise<string[]> {
    try {
      // Build filter formula to get specific records
      const filterFormula = `OR(${recordIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
      const params = new URLSearchParams({
        filterByFormula: filterFormula,
        fields: ['Name']
      });

      const response = await this.fetchFromAirtable(`/${tableName}?${params}`);
      
      // Extract names from the response
      return response.records.map((record: LinkedRecord) => record.fields.Name || 'Unknown');
    } catch (error) {
      console.error(`Error resolving linked records for table ${tableName}:`, error);
      // Return original IDs as fallback
      return recordIds;
    }
  }

  transformRecord(record: AirtableRecord): TransformedCoffeeRecord {
    return {
      id: record.id,
      variety: Array.isArray(record.fields.variety) ? record.fields.variety[0] || 'N/A' : 'N/A',
      process: Array.isArray(record.fields.process) ? record.fields.process[0] || 'N/A' : 'N/A',
      scaa: record.fields.scaa || 0,
      origin: Array.isArray(record.fields.origin) ? record.fields.origin[0] || 'N/A' : 'N/A',
      farm: record.fields.Code || 'N/A',
      flavorsNotes: Array.isArray(record.fields.flavors) ? record.fields.flavors.join(', ') : 'N/A',
      stockKg: record.fields.stock_kg || 0,
      price: record.fields['Price FOB/lb'] || 0,
      status: record.fields.is_ready ? 'Sample requested' : 'Request Samples'
    };
  }

  // Standalone function for fetching stock records with resolved linked fields
  async fetchStockRecordsWithLinkedData(): Promise<TransformedCoffeeRecord[]> {
    try {
      console.log('Fetching stock records with linked data...');
      const response = await this.fetchRecords();
      console.log('Raw response:', response);
      
      const transformedRecords = response.records.map(record => this.transformRecord(record));
      console.log('Transformed records:', transformedRecords);
      
      return transformedRecords;
    } catch (error) {
      console.error('Error in fetchStockRecordsWithLinkedData:', error);
      throw error;
    }
  }
}
