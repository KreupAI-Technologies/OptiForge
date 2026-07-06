'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Palette, Type, Eye, RotateCcw } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface BrandingSettings {
  logo: {
    primary: string;
    secondary: string;
    favicon: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: string;
  };
  layout: {
    sidebarPosition: 'left' | 'right';
    headerStyle: 'fixed' | 'static';
    compactMode: boolean;
  };
  customCSS: string;
}

export default function BrandingPage() {
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'logo' | 'colors' | 'typography' | 'layout' | 'css'>('logo');

  const [settings, setSettings] = useState<BrandingSettings>({
    logo: {
      primary: '',
      secondary: '',
      favicon: ''
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 'medium'
    },
    layout: {
      sidebarPosition: 'left',
      headerStyle: 'fixed',
      compactMode: false
    },
    customCSS: '/* Custom CSS */\n.custom-class {\n  /* Your styles here */\n}'
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await ItAdminService.getConfigValue('it.branding');
        const value = config?.value;
        if (!cancelled && value && typeof value === 'object') {
          setSettings(prev => ({ ...prev, ...(value as Partial<BrandingSettings>) }));
        }
      } catch {
        // ignore; keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleColorChange = (colorKey: keyof BrandingSettings['colors'], value: string) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
    setHasChanges(true);
  };

  const handleTypographyChange = (key: keyof BrandingSettings['typography'], value: string) => {
    setSettings(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleLayoutChange = (key: keyof BrandingSettings['layout'], value: any) => {
    setSettings(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await ItAdminService.setConfigValue('it.branding', settings);
    } catch {
      // best-effort persistence
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      logo: { primary: '', secondary: '', favicon: '' },
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: 'medium'
      },
      layout: {
        sidebarPosition: 'left',
        headerStyle: 'fixed',
        compactMode: false
      },
      customCSS: '/* Custom CSS */\n.custom-class {\n  /* Your styles here */\n}'
    });
    setHasChanges(false);
  };

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Source Sans Pro'
  ];

  const presetThemes = [
    {
      name: 'Default Blue',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981'
      }
    },
    {
      name: 'Professional',
      colors: {
        primary: '#1E40AF',
        secondary: '#64748B',
        accent: '#0EA5E9'
      }
    },
    {
      name: 'Modern Green',
      colors: {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#14B8A6'
      }
    },
    {
      name: 'Corporate Purple',
      colors: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        accent: '#C084FC'
      }
    },
    {
      name: 'Warm Orange',
      colors: {
        primary: '#EA580C',
        secondary: '#F97316',
        accent: '#FB923C'
      }
    }
  ];

  const applyTheme = (theme: typeof presetThemes[0]) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...theme.colors
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'logo', name: 'Logo & Images', icon: Upload },
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'layout', name: 'Layout', icon: Eye },
    { id: 'css', name: 'Custom CSS', icon: Type }
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Branding & Appearance</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your ERP's look and feel</p>
        </div>
        {hasChanges && (
          <>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Settings</h2>

          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-medium text-gray-900 text-sm">{tab.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {activeTab === 'colors' && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Preset Themes</h3>
              <div className="space-y-2">
                {presetThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => applyTheme(theme)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-2">{theme.name}</p>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.secondary }}></div>
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3">
          {/* Logo & Images Tab */}
          {activeTab === 'logo' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Logo & Images</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Drop your logo here or click to browse</p>
                    <p className="text-xs text-gray-500 mb-2">PNG, SVG (Max 2MB, Recommended: 200x60px)</p>
                    <input type="file" className="hidden" id="primary-logo" accept="image/png,image/svg+xml" />
                    <label htmlFor="primary-logo" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block text-sm font-medium">
                      Select File
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Used in the main navigation and login page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Logo (Light)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Drop your light logo here or click to browse</p>
                    <p className="text-xs text-gray-500 mb-2">PNG, SVG (Max 2MB)</p>
                    <input type="file" className="hidden" id="secondary-logo" accept="image/png,image/svg+xml" />
                    <label htmlFor="secondary-logo" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block text-sm font-medium">
                      Select File
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Used on dark backgrounds</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Drop your favicon here or click to browse</p>
                    <p className="text-xs text-gray-500 mb-2">ICO, PNG (32x32px or 64x64px)</p>
                    <input type="file" className="hidden" id="favicon" accept="image/x-icon,image/png" />
                    <label htmlFor="favicon" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block text-sm font-medium">
                      Select File
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Browser tab icon</p>
                </div>
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Brand Colors</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(settings.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-300"
                        style={{ backgroundColor: value }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Color Usage:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Primary:</strong> Main brand color, buttons, links</li>
                  <li>• <strong>Secondary:</strong> Accents, secondary buttons</li>
                  <li>• <strong>Accent:</strong> Highlights, call-to-action elements</li>
                  <li>• <strong>Success/Warning/Error:</strong> Status indicators</li>
                </ul>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Typography</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                  <select
                    value={settings.typography.headingFont}
                    onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">Used for headings and titles</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                  <select
                    value={settings.typography.bodyFont}
                    onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">Used for body text and paragraphs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleTypographyChange('fontSize', size)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.typography.fontSize === size
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900 capitalize">{size}</p>
                        <p className="text-xs text-gray-600">
                          {size === 'small' && '14px'}
                          {size === 'medium' && '16px'}
                          {size === 'large' && '18px'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Preview</h3>
                  <div style={{ fontFamily: settings.typography.headingFont }}>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Heading 1</h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Heading 2</h2>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Heading 3</h3>
                  </div>
                  <div style={{ fontFamily: settings.typography.bodyFont }}>
                    <p className="text-gray-700">
                      This is a sample paragraph showing how your body text will look with the selected font.
                      It helps you visualize the typography choices before applying them to the entire system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Layout Settings</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sidebar Position</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['left', 'right'].map((position) => (
                      <button
                        key={position}
                        onClick={() => handleLayoutChange('sidebarPosition', position)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.layout.sidebarPosition === position
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900 capitalize">{position}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Header Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'fixed', label: 'Fixed', desc: 'Stays visible when scrolling' },
                      { value: 'static', label: 'Static', desc: 'Scrolls with content' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleLayoutChange('headerStyle', option.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          settings.layout.headerStyle === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300">
                    <input
                      type="checkbox"
                      checked={settings.layout.compactMode}
                      onChange={(e) => handleLayoutChange('compactMode', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Compact Mode</p>
                      <p className="text-sm text-gray-600">Reduce spacing and padding for denser layout</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Custom CSS Tab */}
          {activeTab === 'css' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Custom CSS</h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Styles</label>
                  <textarea
                    value={settings.customCSS}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, customCSS: e.target.value }));
                      setHasChanges(true);
                    }}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="/* Add your custom CSS here */"
                  />
                  <p className="text-xs text-gray-600 mt-2">Advanced users can add custom CSS to further customize the appearance</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">Warning:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Custom CSS can override system styles</li>
                    <li>• Test thoroughly before deploying to production</li>
                    <li>• Invalid CSS may break the interface</li>
                    <li>• Keep a backup of working CSS</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
