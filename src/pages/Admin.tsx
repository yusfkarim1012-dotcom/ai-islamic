import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowRight, Lock, Save, Settings } from "lucide-react";
import {
    getAdminConfig,
    saveAdminConfig,
    verifyAdminPassword,
    AdminConfig,
    ModelConfig
} from "@/lib/admin-config";

const Admin = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [config, setConfig] = useState<AdminConfig | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            setConfig(getAdminConfig());
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        if (verifyAdminPassword(password)) {
            setIsAuthenticated(true);
            toast.success("چوویتە ناو لوحەی تحکم");
        } else {
            toast.error("وشەی نهێنی هەڵەیە");
        }
    };

    const handleSave = () => {
        if (config) {
            saveAdminConfig(config);
            toast.success("ڕێکخستنەکان پاشەکەوت کران");
        }
    };

    const updateModelField = (modelId: string, field: keyof ModelConfig, value: any) => {
        if (!config) return;

        const updatedModels = config.models.map(model =>
            model.id === modelId ? { ...model, [field]: value } : model
        );

        setConfig({ ...config, models: updatedModels });
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4" dir="rtl">
                <Card className="w-full max-w-md p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">لوحەی تحکم</h1>
                        <p className="text-muted-foreground">تکایە وشەی نهێنی بنووسە</p>
                    </div>

                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="وشەی نهێنی..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            className="text-center"
                        />
                        <Button onClick={handleLogin} className="w-full gap-2">
                            <span>چوونە ناوەوە</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
                        گەڕانەوە بۆ ماڵەوە
                    </Button>
                </Card>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">لوحەی تحکم</h1>
                            <p className="text-muted-foreground text-sm">بەڕێوەبردنی مۆدێل و ڕێکخستنەکان</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="w-4 h-4" />
                            <span>پاشەکەوتکردن</span>
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/")}>
                            گەڕانەوە
                        </Button>
                    </div>
                </div>

                {/* API Settings */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold border-b pb-2">ڕێکخستنی Manus API</h2>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                                type="password"
                                value={config?.manusApiKey || ""}
                                onChange={(e) => setConfig(prev => prev ? { ...prev, manusApiKey: e.target.value } : null)}
                                placeholder="sk-..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Base URL</Label>
                            <Input
                                value={config?.manusBaseUrl || ""}
                                onChange={(e) => setConfig(prev => prev ? { ...prev, manusBaseUrl: e.target.value } : null)}
                                placeholder="https://api.manus.im/api/llm-proxy/v1"
                            />
                        </div>
                    </div>
                </Card>

                {/* Models */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold border-b pb-2">مۆدێلەکان</h2>

                    <div className="space-y-6">
                        {config?.models.map((model) => (
                            <div key={model.id} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-primary">{model.id}</h3>
                                    <div className="flex items-center gap-2">
                                        <Label>چالاک</Label>
                                        <Switch
                                            checked={model.enabled}
                                            onCheckedChange={(checked) => updateModelField(model.id, 'enabled', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ناوی کورت (لە هیدەر)</Label>
                                        <Input
                                            value={model.name}
                                            onChange={(e) => updateModelField(model.id, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ناوی تەواو</Label>
                                        <Input
                                            value={model.fullName}
                                            onChange={(e) => updateModelField(model.id, 'fullName', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ناوی مۆدێل (API)</Label>
                                        <Input
                                            value={model.model}
                                            onChange={(e) => updateModelField(model.id, 'model', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`apiType-${model.id}`}
                                            checked={model.apiType === 'manus'}
                                            onChange={() => updateModelField(model.id, 'apiType', 'manus')}
                                        />
                                        Manus API
                                    </Label>
                                    <Label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`apiType-${model.id}`}
                                            checked={model.apiType === 'puter'}
                                            onChange={() => updateModelField(model.id, 'apiType', 'puter')}
                                        />
                                        Puter API
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Default Model */}
                <Card className="p-6 space-y-4">
                    <h2 className="text-lg font-bold border-b pb-2">مۆدێلی گریمانەیی</h2>

                    <div className="flex gap-4">
                        {config?.models.map((model) => (
                            <Label key={model.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="defaultModel"
                                    checked={config.defaultModel === model.id}
                                    onChange={() => setConfig(prev => prev ? { ...prev, defaultModel: model.id } : null)}
                                />
                                {model.fullName}
                            </Label>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Admin;
