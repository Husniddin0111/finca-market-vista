
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AirtableConfigProps {
  onConfigSave: (baseId: string, apiKey: string) => void;
  isConfigured: boolean;
}

const AirtableConfig = ({ onConfigSave, isConfigured }: AirtableConfigProps) => {
  const [baseId, setBaseId] = useState(
    localStorage.getItem('airtable_base_id') || 'appnc5K3ijuJIrNqn'
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('airtable_api_key') || ''
  );

  const handleSave = () => {
    if (baseId && apiKey) {
      localStorage.setItem('airtable_base_id', baseId);
      localStorage.setItem('airtable_api_key', apiKey);
      onConfigSave(baseId, apiKey);
    }
  };

  if (isConfigured) {
    return (
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => {
            localStorage.removeItem('airtable_base_id');
            localStorage.removeItem('airtable_api_key');
            window.location.reload();
          }}
        >
          Reconfigure Airtable
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle>Configure Airtable Connection</CardTitle>
        <CardDescription>
          Enter your Airtable Base ID and API Key to connect to your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="baseId">Base ID</Label>
          <Input
            id="baseId"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            placeholder="appnc5K3ijuJIrNqn"
          />
        </div>
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Airtable API Key"
          />
        </div>
        <Button onClick={handleSave} disabled={!baseId || !apiKey} className="w-full">
          Connect to Airtable
        </Button>
      </CardContent>
    </Card>
  );
};

export default AirtableConfig;
