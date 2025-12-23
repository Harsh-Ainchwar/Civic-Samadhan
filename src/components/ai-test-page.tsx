import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { analyzeReportWithAI, suggestCategory, suggestPriority } from "../utils/ai-service";

export function AITestPage() {
  const [title, setTitle] = useState("Large pothole in the street");
  const [description, setDescription] = useState("There is a huge pothole on Main Street that is causing damage to vehicles. It's about 2 feet wide and 1 foot deep.");
  const [address, setAddress] = useState("Main Street & Oak Avenue");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFullAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeReportWithAI(title, description, address);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testCategorySuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const category = await suggestCategory(title, description);
      setResult({ category });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const testPrioritySuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const priority = await suggestPriority(title, description);
      setResult({ priority });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Integration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Report title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Report description"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Report address"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testFullAnalysis} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Testing..." : "Test Full Analysis"}
              </Button>
              <Button 
                onClick={testCategorySuggestion} 
                disabled={loading}
                variant="outline"
              >
                Test Category
              </Button>
              <Button 
                onClick={testPrioritySuggestion} 
                disabled={loading}
                variant="outline"
              >
                Test Priority
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {result ? (
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {loading ? "Testing..." : "Run a test to see results"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}