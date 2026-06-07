import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Check, Sparkles, MessageSquare, Wand2 } from "lucide-react";
import { translations } from "@/lib/translations";
import { getAdminConfig, CONFIG_UPDATED_EVENT } from "@/lib/admin-config";

export type ResponseMode = 'fast' | 'manus' | 'bluesminds' | string;

interface ModelSelectorProps {
    currentMode: ResponseMode;
    onSelectMode: (mode: ResponseMode) => void;
    lang: 'ku' | 'ar';
}

export const ModelSelector = ({ currentMode, onSelectMode, lang }: ModelSelectorProps) => {
    const t = translations[lang];
    
    // Reactive state to force updates on config changes
    const [adminConfig, setAdminConfig] = useState(() => getAdminConfig());

    useEffect(() => {
        const handleConfigUpdate = () => {
            console.log("🔄 ModelSelector: Remote config updated! Syncing state...");
            setAdminConfig(getAdminConfig());
        };
        window.addEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
        return () => window.removeEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    }, []);

    // Get icon based on model id
    const getIcon = (id: string) => {
        switch (id) {
            case 'manus': return Wand2;
            case 'bluesminds': return Brain;
            case 'fast': return Zap;
            default: return Brain;
        }
    };

    // Get color based on model id
    const getColor = (id: string) => {
        switch (id) {
            case 'manus': return 'text-orange-500 bg-orange-500/10';
            case 'bluesminds': return 'text-blue-500 bg-blue-500/10';
            case 'fast': return 'text-yellow-500 bg-yellow-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    // Build modes from admin config
    const modes = adminConfig.models
        .filter(m => m.enabled)
        .map(model => {
            const id = model.id as ResponseMode;
            const tLabel = t[id as keyof typeof t];
            const tFullLabel = t[`${id}Full` as keyof typeof t];
            
            // Check if the admin customized the name from the Kurdish/Arabic defaults
            const isCustomName = model.name !== 'پێشەنگ' && model.name !== 'وردبین' && model.name !== 'الرائد' && model.name !== 'المراقب';
            const isCustomFullName = model.fullName !== 'مۆدێلی پێشەنگ' && model.fullName !== 'مۆدێلی وردبین' && model.fullName !== 'نموذج الرائد' && model.fullName !== 'نموذج المراقب';

            return {
                id,
                icon: getIcon(model.id),
                label: isCustomName ? model.name : (typeof tLabel === 'string' ? tLabel : model.name),
                fullLabel: isCustomFullName ? model.fullName : (typeof tFullLabel === 'string' ? tFullLabel : model.fullName),
                color: getColor(model.id)
            };
        });

    const currentModeData = modes.find(m => m.id === currentMode) || modes[0];
    const CurrentIcon = currentModeData?.icon || Brain;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <CurrentIcon className={`w-4 h-4 ${currentModeData?.color.split(' ')[0]}`} />
                    <span>{currentModeData?.label}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir={lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className="text-center">{t.selectModel}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {modes.map((mode) => (
                        <div
                            key={mode.id}
                            className={`
                                relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${currentMode === mode.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-transparent bg-muted/50 hover:bg-muted hover:border-primary/20'}
                            `}
                            onClick={() => onSelectMode(mode.id)}
                        >
                            <div className={`p-2 rounded-full ${mode.color}`}>
                                <mode.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-right">
                                <h3 className="font-semibold">{mode.fullLabel}</h3>
                            </div>
                            {currentMode === mode.id && (
                                <div className="absolute top-3 left-3 text-primary">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

