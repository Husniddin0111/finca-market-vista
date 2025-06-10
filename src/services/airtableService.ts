
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
  private baseUrl: string;
  private apiKey: string;

  constructor(baseId: string, apiKey: string) {
    this.baseUrl = `https://api.airtable.com/v0/${baseId}/stock`;
    this.apiKey = apiKey;
  }

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
