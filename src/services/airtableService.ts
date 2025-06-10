
export interface AirtableRecord {
  id: string;
  fields: {
    Supplier?: string;
    Farm?: string;
    Variety?: string;
    Flavors?: string;
    Origin?: string;
    'Stock KG'?: number;
    SCAA?: number;
    Price?: number;
  };
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export class AirtableService {
  private baseUrl: string = 'https://api.airtable.com/v0/appnc5K3ijuJIrNqn/stock';
  private apiKey: string = 'patlA5ApKpEDGVeWJ.a75203c8e393a2a95b4ef847004d1bbd700fc189f8b9f8e6a2474e7d4bbcca18';

  async fetchRecords(offset?: string, pageSize: number = 10): Promise<AirtableResponse> {
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
    });

    if (offset) {
      params.append('offset', offset);
    }

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Airtable data:', error);
      throw error;
    }
  }

  transformRecord(record: AirtableRecord) {
    return {
      id: record.id,
      supplier: record.fields.Supplier || '',
      farm: record.fields.Farm || '',
      variety: record.fields.Variety || '',
      flavors: record.fields.Flavors || '',
      origin: record.fields.Origin || '',
      stockKg: record.fields['Stock KG'] || 0,
      scaa: record.fields.SCAA || 0,
      price: record.fields.Price || 0,
    };
  }
}
