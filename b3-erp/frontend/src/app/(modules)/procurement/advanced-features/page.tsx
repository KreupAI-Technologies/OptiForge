'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    FileCheck,
    Gavel,
    GitBranch,
    AlertTriangle,
    TrendingUp,
    PieChart,
    ArrowRight,
    Users,
    Shield,
    CheckCircle2,
    Clock,
    BarChart3,
    DollarSign,
    FileText,
    Send,
    Activity,
    Target,
    Zap,
    Settings,
    Star,
    Percent,
    Award,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface FeatureCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    stats?: { label: string; value: string }[];
    link?: string;
    status?: 'active' | 'beta' | 'coming-soon';
}

export default function AdvancedFeaturesPage() {
    const searchParams = useSearchParams();
    const [activeSection, setActiveSection] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for hash in URL and scroll to section
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setActiveSection(hash);
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
        setLoading(false);
    }, []);

    const portalFeatures: FeatureCard[] = [
        {
            id: 'vendor-self-service',
            title: 'Vendor Self-Service Portal',
            description: 'Enable vendors to manage their profiles, submit quotes, and track orders',
            icon: <Building2 className="h-6 w-6 text-blue-600" />,
            stats: [
                { label: 'Active Vendors', value: '156' },
                { label: 'Portal Logins Today', value: '42' },
            ],
            link: '/procurement/supplier-portal',
            status: 'active',
        },
        {
            id: 'quote-submission',
            title: 'Online Quote Submission',
            description: 'Vendors can respond to RFQs directly through the portal',
            icon: <Send className="h-6 w-6 text-green-600" />,
            stats: [
                { label: 'Pending Quotes', value: '23' },
                { label: 'Avg Response Time', value: '2.3 days' },
            ],
            link: '/procurement/rfq',
            status: 'active',
        },
        {
            id: 'vendor-documents',
            title: 'Document Management',
            description: 'Centralized storage for vendor certifications, contracts, and compliance docs',
            icon: <FileText className="h-6 w-6 text-purple-600" />,
            stats: [
                { label: 'Total Documents', value: '1,245' },
                { label: 'Expiring Soon', value: '18' },
            ],
            status: 'active',
        },
    ];

    const contractFeatures: FeatureCard[] = [
        {
            id: 'contract-tracking',
            title: 'Contract Lifecycle Management',
            description: 'Track contracts from creation through expiration with automated alerts',
            icon: <FileCheck className="h-6 w-6 text-indigo-600" />,
            stats: [
                { label: 'Active Contracts', value: '89' },
                { label: 'Expiring in 30 Days', value: '7' },
            ],
            link: '/procurement/contract-management',
            status: 'active',
        },
        {
            id: 'compliance-tracking',
            title: 'Compliance Monitoring',
            description: 'Ensure vendor compliance with contract terms and regulatory requirements',
            icon: <Shield className="h-6 w-6 text-emerald-600" />,
            stats: [
                { label: 'Compliance Rate', value: '94.5%' },
                { label: 'Issues Open', value: '12' },
            ],
            link: '/procurement/compliance',
            status: 'active',
        },
        {
            id: 'renewal-automation',
            title: 'Automated Renewals',
            description: 'Set up automatic renewal workflows and reminders for key contracts',
            icon: <GitBranch className="h-6 w-6 text-orange-600" />,
            stats: [
                { label: 'Auto-Renewals Set', value: '34' },
                { label: 'Due This Quarter', value: '8' },
            ],
            status: 'active',
        },
    ];

    const sourcingFeatures: FeatureCard[] = [
        {
            id: 'rfq-management',
            title: 'RFQ/RFP Management',
            description: 'Create, distribute, and manage requests for quotes and proposals',
            icon: <Gavel className="h-6 w-6 text-blue-600" />,
            stats: [
                { label: 'Open RFQs', value: '15' },
                { label: 'Responses Pending', value: '47' },
            ],
            link: '/procurement/rfq',
            status: 'active',
        },
        {
            id: 'reverse-auctions',
            title: 'Reverse Auctions',
            description: 'Run competitive bidding events to achieve best pricing',
            icon: <TrendingUp className="h-6 w-6 text-green-600" />,
            stats: [
                { label: 'Avg Savings', value: '12.5%' },
                { label: 'Events This Month', value: '3' },
            ],
            status: 'beta',
        },
        {
            id: 'strategic-sourcing',
            title: 'Strategic Sourcing',
            description: 'Develop long-term sourcing strategies and supplier relationships',
            icon: <Target className="h-6 w-6 text-purple-600" />,
            stats: [
                { label: 'Categories Managed', value: '24' },
                { label: 'Strategic Suppliers', value: '45' },
            ],
            link: '/procurement/strategic-sourcing',
            status: 'active',
        },
    ];

    const approvalFeatures: FeatureCard[] = [
        {
            id: 'multi-level-approvals',
            title: 'Multi-Level Approval Workflows',
            description: 'Configure approval chains based on amount, category, or department',
            icon: <GitBranch className="h-6 w-6 text-blue-600" />,
            stats: [
                { label: 'Active Workflows', value: '8' },
                { label: 'Pending Approvals', value: '23' },
            ],
            link: '/procurement/approvals',
            status: 'active',
        },
        {
            id: 'delegation',
            title: 'Approval Delegation',
            description: 'Set up out-of-office delegation for seamless approval continuity',
            icon: <Users className="h-6 w-6 text-green-600" />,
            stats: [
                { label: 'Active Delegations', value: '5' },
            ],
            status: 'active',
        },
        {
            id: 'mobile-approvals',
            title: 'Mobile Approvals',
            description: 'Approve purchase orders and requisitions from any device',
            icon: <Zap className="h-6 w-6 text-yellow-600" />,
            stats: [
                { label: 'Mobile Approvals Today', value: '12' },
            ],
            status: 'active',
        },
    ];

    const riskFeatures: FeatureCard[] = [
        {
            id: 'risk-scoring',
            title: 'Supplier Risk Scoring',
            description: 'Automated risk assessment based on financial, operational, and compliance factors',
            icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
            stats: [
                { label: 'High Risk Suppliers', value: '8' },
                { label: 'Avg Risk Score', value: '2.3/5' },
            ],
            link: '/procurement/risk-management',
            status: 'active',
        },
        {
            id: 'credit-monitoring',
            title: 'Credit Monitoring',
            description: 'Track supplier financial health and creditworthiness',
            icon: <Activity className="h-6 w-6 text-orange-600" />,
            stats: [
                { label: 'Monitored Suppliers', value: '89' },
                { label: 'Alerts This Month', value: '3' },
            ],
            status: 'beta',
        },
        {
            id: 'supply-chain-risk',
            title: 'Supply Chain Risk Analysis',
            description: 'Identify and mitigate supply chain vulnerabilities',
            icon: <Shield className="h-6 w-6 text-indigo-600" />,
            stats: [
                { label: 'Risk Categories', value: '12' },
                { label: 'Mitigation Plans', value: '24' },
            ],
            status: 'active',
        },
    ];

    const savingsFeatures: FeatureCard[] = [
        {
            id: 'savings-dashboard',
            title: 'Savings Dashboard',
            description: 'Real-time visibility into procurement cost savings and avoidance',
            icon: <DollarSign className="h-6 w-6 text-green-600" />,
            stats: [
                { label: 'YTD Savings', value: '$1.2M' },
                { label: 'Savings Rate', value: '8.2%' },
            ],
            link: '/procurement/savings-tracker',
            status: 'active',
        },
        {
            id: 'negotiation-tracking',
            title: 'Negotiation Tracking',
            description: 'Track price reductions and value improvements from negotiations',
            icon: <Percent className="h-6 w-6 text-blue-600" />,
            stats: [
                { label: 'Avg Discount', value: '15%' },
                { label: 'Negotiations Closed', value: '34' },
            ],
            status: 'active',
        },
        {
            id: 'benchmark-analysis',
            title: 'Price Benchmarking',
            description: 'Compare pricing against market benchmarks and historical data',
            icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
            stats: [
                { label: 'Categories Benchmarked', value: '18' },
                { label: 'Below Market', value: '72%' },
            ],
            status: 'active',
        },
    ];

    const spendFeatures: FeatureCard[] = [
        {
            id: 'spend-analytics',
            title: 'Spend Analytics Dashboard',
            description: 'Deep insights into procurement spending patterns and trends',
            icon: <PieChart className="h-6 w-6 text-blue-600" />,
            stats: [
                { label: 'Total Spend YTD', value: '$45M' },
                { label: 'Categories Analyzed', value: '32' },
            ],
            link: '/procurement/spend-analysis',
            status: 'active',
        },
        {
            id: 'category-analysis',
            title: 'Category Analysis',
            description: 'Detailed breakdown of spending by category and subcategory',
            icon: <BarChart3 className="h-6 w-6 text-green-600" />,
            stats: [
                { label: 'Top Category', value: 'Raw Materials' },
                { label: 'Categories', value: '24' },
            ],
            link: '/procurement/category-management',
            status: 'active',
        },
        {
            id: 'vendor-consolidation',
            title: 'Vendor Consolidation Opportunities',
            description: 'Identify opportunities to consolidate spending with fewer vendors',
            icon: <Users className="h-6 w-6 text-purple-600" />,
            stats: [
                { label: 'Potential Savings', value: '$320K' },
                { label: 'Consolidation Opportunities', value: '8' },
            ],
            status: 'active',
        },
    ];

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
            case 'beta':
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Beta</Badge>;
            case 'coming-soon':
                return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Coming Soon</Badge>;
            default:
                return null;
        }
    };

    const renderFeatureCards = (features: FeatureCard[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-gray-100 rounded-lg">{feature.icon}</div>
                            {getStatusBadge(feature.status)}
                        </div>
                        <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {feature.stats && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {feature.stats.map((stat, idx) => (
                                    <div key={idx} className="text-center p-2 bg-gray-50 rounded-lg">
                                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs text-gray-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {feature.link && (
                            <Link href={feature.link}>
                                <Button variant="outline" className="w-full">
                                    Explore Feature
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="w-full p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading advanced features...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                            <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Advanced Procurement Features</h1>
                            <p className="text-gray-600">Enterprise-grade procurement capabilities</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Active Features</p>
                                    <p className="text-3xl font-bold">18</p>
                                </div>
                                <CheckCircle2 className="h-10 w-10 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Cost Savings YTD</p>
                                    <p className="text-3xl font-bold">$1.2M</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Active Vendors</p>
                                    <p className="text-3xl font-bold">156</p>
                                </div>
                                <Users className="h-10 w-10 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">Compliance Rate</p>
                                    <p className="text-3xl font-bold">94.5%</p>
                                </div>
                                <Shield className="h-10 w-10 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Feature Categories */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="portal">Portal</TabsTrigger>
                        <TabsTrigger value="contracts">Contracts</TabsTrigger>
                        <TabsTrigger value="sourcing">Sourcing</TabsTrigger>
                        <TabsTrigger value="approvals">Approvals</TabsTrigger>
                        <TabsTrigger value="risk">Risk</TabsTrigger>
                        <TabsTrigger value="savings">Savings</TabsTrigger>
                        <TabsTrigger value="spend">Spend</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-8">
                        <section id="portal" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Supplier Portal
                            </h2>
                            {renderFeatureCards(portalFeatures)}
                        </section>

                        <section id="contracts" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-indigo-600" />
                                Contract Compliance
                            </h2>
                            {renderFeatureCards(contractFeatures)}
                        </section>

                        <section id="sourcing" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Gavel className="h-5 w-5 text-green-600" />
                                Sourcing Events
                            </h2>
                            {renderFeatureCards(sourcingFeatures)}
                        </section>

                        <section id="approvals" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GitBranch className="h-5 w-5 text-purple-600" />
                                Approval Workflows
                            </h2>
                            {renderFeatureCards(approvalFeatures)}
                        </section>

                        <section id="risk" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Supplier Risk Scoring
                            </h2>
                            {renderFeatureCards(riskFeatures)}
                        </section>

                        <section id="savings" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                Savings Tracking
                            </h2>
                            {renderFeatureCards(savingsFeatures)}
                        </section>

                        <section id="spend" className="scroll-mt-20">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-600" />
                                Spend Analytics
                            </h2>
                            {renderFeatureCards(spendFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="portal">
                        <section id="portal">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Supplier Portal
                            </h2>
                            {renderFeatureCards(portalFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="contracts">
                        <section id="contracts">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-indigo-600" />
                                Contract Compliance
                            </h2>
                            {renderFeatureCards(contractFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="sourcing">
                        <section id="sourcing">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Gavel className="h-5 w-5 text-green-600" />
                                Sourcing Events
                            </h2>
                            {renderFeatureCards(sourcingFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="approvals">
                        <section id="approvals">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GitBranch className="h-5 w-5 text-purple-600" />
                                Approval Workflows
                            </h2>
                            {renderFeatureCards(approvalFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="risk">
                        <section id="risk">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Supplier Risk Scoring
                            </h2>
                            {renderFeatureCards(riskFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="savings">
                        <section id="savings">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                Savings Tracking
                            </h2>
                            {renderFeatureCards(savingsFeatures)}
                        </section>
                    </TabsContent>

                    <TabsContent value="spend">
                        <section id="spend">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-600" />
                                Spend Analytics
                            </h2>
                            {renderFeatureCards(spendFeatures)}
                        </section>
                    </TabsContent>
                </Tabs>

                {/* Feature Request Section */}
                <Card className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <CardContent className="py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Settings className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Need a Custom Feature?</h3>
                                    <p className="text-gray-300 mt-1">
                                        Contact our team to discuss custom procurement solutions tailored to your needs
                                    </p>
                                </div>
                            </div>
                            <Button className="bg-white text-gray-900 hover:bg-gray-100">
                                Request Feature
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
