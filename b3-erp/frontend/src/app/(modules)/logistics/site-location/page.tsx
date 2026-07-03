'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    ArrowRight,
    MapPinned,
    User,
    Phone,
    Clock,
    Save,
    Send,
    Search,
    FolderKanban,
    Building2,
    Loader2,
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

export default function SiteLocationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Project selection state
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    // Page data state
    const [formData, setFormData] = useState({
        siteAddress: '123, Pearl Apartments, Tower A',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        contactPerson: 'Mr. Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        alternatePhone: '+91 98765 43211',
        deliveryDate: '2024-12-18',
        preferredTime: '10:00 AM - 2:00 PM',
        specialInstructions: 'Security clearance required. Contact before arrival.',
        landmarks: 'Near MG Road Metro Station, Opposite Prestige Mall'
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const allProjects = await projectManagementService.getProjects();
            const projectInfos: ProjectInfo[] = allProjects.map((p: Project) => ({
                id: p.id,
                name: p.name || `Project ${p.id}`,
                clientName: p.clientName || 'Unknown Client',
                status: p.status || 'active',
            }));
            setProjects(projectInfos);

            const projectId = searchParams.get('projectId');
            if (projectId) {
                const found = projectInfos.find(p => p.id === projectId);
                if (found) {
                    setSelectedProject(found);
                }
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        toast({ title: 'Project Selected', description: `Viewing site location for ${project.name}` });
    };

    const handleChangeProject = () => {
        setSelectedProject(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = () => {
        toast({
            title: 'Location Details Saved',
            description: 'Site location information has been saved successfully',
        });
    };

    const handleShare = () => {
        toast({
            title: 'Location Shared',
            description: 'Site location details have been shared with logistics team and transporter',
        });
        setTimeout(() => router.push('/logistics/transporter-notification'), 1000);
    };

    // Project Selection View
    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <MapPinned className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Site Location Sharing</h1>
                                <p className="text-sm text-gray-600">Select a project to manage site location</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban className="h-5 w-5 text-orange-600" />
                                                <CardTitle className="text-base">{project.name}</CardTitle>
                                            </div>
                                            <Badge variant="outline" className="capitalize">{project.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Building2 className="h-4 w-4" />
                                            <span>{project.clientName}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Select Project</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main Content View
    return (
        <div className="w-full py-2 space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MapPinned className="h-8 w-8 text-orange-600" />
                        Site Location Sharing
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button onClick={handleShare}>
                        <Send className="mr-2 h-4 w-4" />
                        Share & Continue
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Site Address */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Delivery Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-2">
                            <Label htmlFor="siteAddress">Site Address</Label>
                            <Textarea
                                id="siteAddress"
                                value={formData.siteAddress}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('siteAddress', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                                id="pincode"
                                value={formData.pincode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pincode', e.target.value)}
                                className="w-48"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="landmarks">Nearby Landmarks</Label>
                            <Textarea
                                id="landmarks"
                                value={formData.landmarks}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('landmarks', e.target.value)}
                                rows={2}
                                placeholder="Landmarks or directions to help locate the site"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Location Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                            <MapPinned className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <div className="text-muted-foreground">Destination</div>
                                <div className="font-medium">{formData.city}, {formData.state}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <div className="text-muted-foreground">Contact Person</div>
                                <div className="font-medium">{formData.contactPerson}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <div className="text-muted-foreground">Delivery Window</div>
                                <div className="font-medium">{formData.preferredTime}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Site Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person Name</Label>
                            <div className="flex gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-2.5" />
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactPerson', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Primary Phone</Label>
                            <div className="flex gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-2.5" />
                                <Input
                                    id="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                            <div className="flex gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-2.5" />
                                <Input
                                    id="alternatePhone"
                                    value={formData.alternatePhone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('alternatePhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Timing */}
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
                            <Input
                                type="date"
                                id="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('deliveryDate', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="preferredTime">Preferred Time Window</Label>
                            <Input
                                id="preferredTime"
                                value={formData.preferredTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('preferredTime', e.target.value)}
                                placeholder="e.g., 10:00 AM - 2:00 PM"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialInstructions">Special Instructions</Label>
                        <Textarea
                            id="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('specialInstructions', e.target.value)}
                            rows={3}
                            placeholder="Any special delivery instructions, access restrictions, or requirements"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                </Button>
                <Button onClick={handleShare}>
                    <Send className="mr-2 h-4 w-4" />
                    Share with Logistics
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
