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

    const handleSave = async () => {
        if (config) {
            const cleanManusKeys = (config.manusApiKeys || []).map(k => k.trim());
            const firstActiveManusKey = cleanManusKeys.find(k => k !== '') || '';
            
            const cleanBluesmindsKeys = (config.bluesmindsApiKeys || []).map(k => k.trim());
            const firstActiveBluesmindsKey = cleanBluesmindsKeys.find(k => k !== '') || '';
            
            const updatedConfig = {
                ...config,
                manusApiKey: firstActiveManusKey,
                manusApiKeys: cleanManusKeys,
                bluesmindsApiKey: firstActiveBluesmindsKey,
                bluesmindsApiKeys: cleanBluesmindsKeys
            };
            const success = await saveAdminConfig(updatedConfig);
            if (success) {
                toast.success("ڕێکخستنەکان پاشەکەوت کران بۆ هەموو بەکارهێنەران");
            } else {
                toast.error("کێشە لە پاشەکەوتکردن. تکایە دووبارە هەوڵبدە.");
            }
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

                {/* Section 1: Server and API Key Controls */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground/80 border-r-4 border-primary pr-3 py-1 bg-primary/5 rounded-l">
                        🔌 کلیلەکانی API و کۆنتڕۆڵی سێرڤەرەکان (Servers & API Keys)
                    </h2>

                    {/* Server Controls */}
                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-bold border-b pb-2">🎛️ کۆنتڕۆڵی سێرڤەرەکان (Server Controls)</h3>
                        
                        {/* Server Disable Toggle */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold block">کوژاندنەوەی سێرڤەر (Disable Server)</Label>
                            <div className="flex rounded-lg overflow-hidden border border-input bg-background">
                                {[
                                    { value: "", label: "هیچ کام نەکوژێنە" },
                                    { value: "bluesminds", label: "Bluesminds بکوژێنە" },
                                    { value: "manus", label: "Manus بکوژێنە" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            if (config) {
                                                setConfig({ ...config, serverDisabled: opt.value });
                                            }
                                        }}
                                        className={`flex-1 py-2 text-xs font-bold transition-all duration-200 ${
                                            config?.serverDisabled === opt.value
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted text-foreground"
                                        }`}
                                        style={{ borderLeft: opt.value !== "" ? "1px solid var(--border)" : "none" }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">کاتێک سێرڤەرێک بکوژێنیت، داواکاری API بۆ ئەو سێرڤەرە نانێردرێت و ڕاستەوخۆ دەچێتە سێرڤەری دواتر.</p>
                        </div>

                        {/* Server Priority Toggle */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold block">ڕیزبەندی سێرڤەر (Server Priority)</Label>
                            <div className="flex rounded-lg overflow-hidden border border-input bg-background">
                                {[
                                    { value: "bluesminds_first", label: "Bluesminds یەکەم" },
                                    { value: "manus_first", label: "Manus یەکەم" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            if (config) {
                                                setConfig({ ...config, serverPriority: opt.value });
                                            }
                                        }}
                                        className={`flex-1 py-2 text-xs font-bold transition-all duration-200 ${
                                            config?.serverPriority === opt.value
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted text-foreground"
                                        }`}
                                        style={{ borderLeft: opt.value !== "bluesminds_first" ? "1px solid var(--border)" : "none" }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">ئەمە ڕێژەی سەرەکی دیاری دەکات کە کام سێرڤەر یەکەم جار وەڵام بداتەوە.</p>
                        </div>
                    </Card>

                    {/* Bluesminds API Settings */}
                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-bold border-b pb-2">🔑 ڕێکخستنی Bluesminds API</h3>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>کلیلەکانی API (تا ١٠ کلیل - بەپێی ڕیزبەندی کار دەکەن)</Label>
                                <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-2" dir="ltr">
                                    {Array.from({ length: 10 }).map((_, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <span className="text-xs font-semibold text-muted-foreground w-16 text-right">Key {index + 1}:</span>
                                            <Input
                                                type="text"
                                                value={config?.bluesmindsApiKeys?.[index] || ""}
                                                onChange={(e) => {
                                                    if (config) {
                                                        const newKeys = [...(config.bluesmindsApiKeys || [])];
                                                        while (newKeys.length < 10) newKeys.push('');
                                                        newKeys[index] = e.target.value;
                                                        setConfig({ ...config, bluesmindsApiKeys: newKeys });
                                                    }
                                                }}
                                                placeholder="sk-..."
                                                className="font-mono text-left text-sm"
                                                autoComplete="off"
                                                name={`bluesminds-key-field-${index}`}
                                                data-lpignore="true"
                                                data-1pignore="true"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Base URL</Label>
                                <Input
                                    value={config?.bluesmindsBaseUrl || ""}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, bluesmindsBaseUrl: e.target.value } : null)}
                                    placeholder="https://api.bluesminds.com/v1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>ناوی مۆدێل (Bluesminds Model Name)</Label>
                                <Input
                                    value={config?.bluesmindsModel || ""}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, bluesmindsModel: e.target.value } : null)}
                                    placeholder="gemini-2.5-flash"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Manus API Settings */}
                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-bold border-b pb-2">🔑 ڕێکخستنی Manus API</h3>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>کلیلەکانی API (تا ١٠ کلیل - بەپێی ڕیزبەندی کار دەکەن)</Label>
                                <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-2" dir="ltr">
                                    {Array.from({ length: 10 }).map((_, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <span className="text-xs font-semibold text-muted-foreground w-16 text-right">Key {index + 1}:</span>
                                            <Input
                                                type="text"
                                                value={config?.manusApiKeys?.[index] || ""}
                                                onChange={(e) => {
                                                    if (config) {
                                                        const newKeys = [...(config.manusApiKeys || [])];
                                                        while (newKeys.length < 10) newKeys.push('');
                                                        newKeys[index] = e.target.value;
                                                        setConfig({ ...config, manusApiKeys: newKeys });
                                                    }
                                                }}
                                                placeholder="sk-..."
                                                className="font-mono text-left text-sm"
                                                autoComplete="off"
                                                name={`manus-key-field-${index}`}
                                                data-lpignore="true"
                                                data-1pignore="true"
                                            />
                                        </div>
                                    ))}
                                </div>
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
                </div>

                {/* Section 2: Model Configuration */}
                <div className="space-y-4 pt-6">
                    <h2 className="text-xl font-bold text-foreground/80 border-r-4 border-primary pr-3 py-1 bg-primary/5 rounded-l">
                        🤖 ڕێکخستنی مۆدێلەکان (Model Configurations)
                    </h2>

                    {config?.models.map((model) => (
                        <Card key={model.id} className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-lg font-bold text-primary">ڕێکخستنی مۆدێلی {model.fullName} ({model.id})</h3>
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
                                    <Label>ناوی مۆدێل لەسەر API (Model ID)</Label>
                                    <Input
                                        value={model.model}
                                        onChange={(e) => updateModelField(model.id, 'model', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-sm font-semibold block mb-1">جۆری API بۆ ئەم مۆدێلە:</Label>
                                <div className="flex gap-4">
                                    <Label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`apiType-${model.id}`}
                                            checked={model.apiType === 'manus'}
                                            onChange={() => updateModelField(model.id, 'apiType', 'manus')}
                                        />
                                        Manus API
                                    </Label>
                                    <Label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`apiType-${model.id}`}
                                            checked={model.apiType === 'bluesminds'}
                                            onChange={() => updateModelField(model.id, 'apiType', 'bluesminds')}
                                        />
                                        Bluesminds API
                                    </Label>
                                    <Label className="flex items-center gap-2 cursor-pointer">
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
                        </Card>
                    ))}

                    {/* Default Model */}
                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-bold border-b pb-2">مۆدێلی گریمانەیی (Default Model)</h3>

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
        </div>
    );
};

export default Admin;
