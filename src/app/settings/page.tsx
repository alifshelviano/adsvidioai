import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <>
      <Header pageTitle="Settings" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Manage settings for AI content generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voice-style">Voice Style</Label>
                <Select defaultValue="algenib">
                  <SelectTrigger id="voice-style">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algenib">Algenib (Default)</SelectItem>
                    <SelectItem value="auriga">Auriga</SelectItem>
                    <SelectItem value="sirius">Sirius</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en-us">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-us">English (US)</SelectItem>
                    <SelectItem value="en-gb">English (UK)</SelectItem>
                    <SelectItem value="es-es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Enter your optional API keys for third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="••••••••••••••••••••"
                  className="font-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="••••••••••••••••••••"
                  className="font-code"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </>
  );
}
