'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, RefreshCw, Monitor, Calendar, Key, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import type { SessionData } from '@/lib/session-utils';

export default function SessionManagementPage() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [invalidating, setInvalidating] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/sessions');
            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load sessions',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleInvalidate = async (sessionId: string) => {
        if (!confirm('Are you sure you want to invalidate this session? The user will be logged out.')) {
            return;
        }

        setInvalidating(sessionId);
        try {
            const response = await fetch('/api/sessions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: sessionId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Session invalidated successfully',
                });
                fetchSessions(); // Refresh the list
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: data.error || 'Failed to invalidate session',
                });
            }
        } catch (error) {
            console.error('Failed to invalidate session:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to invalidate session',
            });
        } finally {
            setInvalidating(null);
        }
    };

    const getSessionStatus = (session: SessionData) => {
        if (session.isExpired === 1) {
            return { label: 'Invalidated', variant: 'destructive' as const };
        }

        const expiresAt = new Date(session.expires_at);
        const now = new Date();

        if (expiresAt < now) {
            return { label: 'Expired', variant: 'secondary' as const };
        }

        return { label: 'Active', variant: 'default' as const };
    };

    const activeSessions = sessions.filter(s => s.isExpired === 0 && new Date(s.expires_at) > new Date());
    const inactiveSessions = sessions.filter(s => s.isExpired === 1 || new Date(s.expires_at) <= new Date());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold !font-headline">Session Management</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage active user sessions
                    </p>
                </div>
                <Button onClick={fetchSessions} variant="outline" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sessions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Monitor className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Sessions</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">{inactiveSessions.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Sessions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Sessions</CardTitle>
                    <CardDescription>
                        Manage all authentication sessions. Invalidating a session will log out the user.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading sessions...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No sessions found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead>Session ID</TableHead>
                                        <TableHead>Device ID</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const status = getSessionStatus(session);
                                        return (
                                            <TableRow key={session.session_id}>
                                                <TableCell className="font-medium">
                                                    {session.username}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={status.variant}>
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Key className="h-4 w-4 text-muted-foreground" />
                                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                                            {session.session_id.substring(0, 12)}...
                                                        </code>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {session.device_id.substring(0, 8)}...
                                                    </code>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleInvalidate(session.session_id)}
                                                        disabled={session.isExpired === 1 || invalidating === session.session_id}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {invalidating === session.session_id ? 'Invalidating...' : 'Invalidate'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
