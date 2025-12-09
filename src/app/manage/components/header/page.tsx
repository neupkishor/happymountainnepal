'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Trash2,
    Save,
    ChevronRight,
    ChevronDown,
    GripVertical,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NavLink {
    title: string;
    href?: string;
    description?: string;
    children?: NavLink[];
}

interface NavigationData {
    header: {
        links: NavLink[];
    };
    footer: {
        links: NavLink[];
    };
}

export default function HeaderManagementPage() {
    const [links, setLinks] = useState<NavLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [previewMode, setPreviewMode] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch('/navigation-components.json');
            const data: NavigationData = await response.json();
            setLinks(data.header.links || []);
        } catch (error) {
            console.error('Error loading navigation data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load navigation data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const saveData = async () => {
        setSaving(true);
        try {
            // Load current data
            const response = await fetch('/navigation-components.json');
            const data: NavigationData = await response.json();

            // Update header links
            data.header.links = links;

            // Save to file via API
            const saveResponse = await fetch('/api/navigation-components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!saveResponse.ok) throw new Error('Failed to save');

            toast({
                title: 'Success',
                description: 'Header navigation updated successfully',
            });
        } catch (error) {
            console.error('Error saving navigation data:', error);
            toast({
                title: 'Error',
                description: 'Failed to save navigation data',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleExpand = (path: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedItems(newExpanded);
    };

    const updateLink = (path: number[], field: keyof NavLink, value: string) => {
        const newLinks = JSON.parse(JSON.stringify(links));
        let current: any = newLinks;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]].children;
        }

        current[path[path.length - 1]][field] = value;
        setLinks(newLinks);
    };

    const addLink = (path: number[], level: number) => {
        const newLinks = JSON.parse(JSON.stringify(links));
        const newLink: NavLink = {
            title: 'New Link',
            ...(level < 3 ? {} : { href: '#', description: '' })
        };

        if (path.length === 0) {
            // Add to root
            newLinks.push(newLink);
        } else {
            let current: any = newLinks;
            for (let i = 0; i < path.length; i++) {
                if (i === path.length - 1) {
                    if (!current[path[i]].children) {
                        current[path[i]].children = [];
                    }
                    current[path[i]].children.push(newLink);
                } else {
                    current = current[path[i]].children;
                }
            }
        }

        setLinks(newLinks);
    };

    const deleteLink = (path: number[]) => {
        const newLinks = JSON.parse(JSON.stringify(links));

        if (path.length === 1) {
            newLinks.splice(path[0], 1);
        } else {
            let current: any = newLinks;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]].children;
            }
            current.splice(path[path.length - 1], 1);
        }

        setLinks(newLinks);
    };

    const renderLinkEditor = (link: NavLink, path: number[], level: number) => {
        const pathString = path.join('-');
        const isExpanded = expandedItems.has(pathString);
        const hasChildren = link.children && link.children.length > 0;
        const canHaveChildren = level < 3;

        return (
            <div key={pathString} className="space-y-2">
                <Card className={cn("transition-all", level === 1 && "border-l-4 border-l-primary")}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    {canHaveChildren && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(pathString)}
                                            className="h-6 w-6 p-0"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Level {level}
                                    </span>
                                    {hasChildren && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {link.children!.length} {link.children!.length === 1 ? 'child' : 'children'}
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <div>
                                        <Label htmlFor={`title-${pathString}`}>Title</Label>
                                        <Input
                                            id={`title-${pathString}`}
                                            value={link.title}
                                            onChange={(e) => updateLink(path, 'title', e.target.value)}
                                            placeholder="Link title"
                                        />
                                    </div>

                                    {level > 1 && (
                                        <>
                                            <div>
                                                <Label htmlFor={`href-${pathString}`}>URL (optional for parent items)</Label>
                                                <Input
                                                    id={`href-${pathString}`}
                                                    value={link.href || ''}
                                                    onChange={(e) => updateLink(path, 'href', e.target.value)}
                                                    placeholder="/path or https://example.com"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`desc-${pathString}`}>Description</Label>
                                                <Textarea
                                                    id={`desc-${pathString}`}
                                                    value={link.description || ''}
                                                    onChange={(e) => updateLink(path, 'description', e.target.value)}
                                                    placeholder="Brief description"
                                                    rows={2}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {canHaveChildren && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addLink(path, level + 1)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Child
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteLink(path)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {hasChildren && isExpanded && (
                    <div className="ml-8 space-y-2 border-l-2 border-border pl-4">
                        {link.children!.map((child, index) =>
                            renderLinkEditor(child, [...path, index], level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading navigation data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/manage/components">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold font-headline mt-2">Header Navigation</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your website's main navigation menu structure
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        {previewMode ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Preview
                            </>
                        )}
                    </Button>
                    <Button onClick={saveData} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {previewMode && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Preview</CardTitle>
                        <CardDescription>
                            This is how your navigation structure looks (simplified view)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded-lg">
                            {JSON.stringify(links, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Navigation Links</h2>
                    <Button onClick={() => addLink([], 1)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Level 1 Link
                    </Button>
                </div>

                {links.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">No navigation links yet</p>
                            <Button onClick={() => addLink([], 1)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Link
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {links.map((link, index) => renderLinkEditor(link, [index], 1))}
                    </div>
                )}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-lg">Navigation Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>• <strong>Level 1:</strong> Top navigation items (shown in header bar)</p>
                    <p>• <strong>Level 2:</strong> Dropdown items (left column in mega menu)</p>
                    <p>• <strong>Level 3:</strong> Sub-items (right column in mega menu)</p>
                    <p>• Items without children and with href will be clickable links</p>
                    <p>• Items with children act as category headers</p>
                    <p>• On mobile, users navigate through levels progressively</p>
                </CardContent>
            </Card>
        </div>
    );
}
