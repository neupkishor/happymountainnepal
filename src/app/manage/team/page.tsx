'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, GripVertical, Pencil, Trash2, Users } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy as firestoreOrderBy } from 'firebase/firestore';
import type { TeamMember, TeamGroup } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createTeamGroup, updateTeamGroup, deleteTeamGroup, batchUpdateTeamMemberPositions, batchUpdateTeamGroupOrder } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null);
  const [draggedGroup, setDraggedGroup] = useState<TeamGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editingGroup, setEditingGroup] = useState<TeamGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;
    fetchData();
  }, [firestore]);

  const fetchData = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      // Fetch team members
      const membersRef = collection(firestore, 'teamMembers');
      const membersSnapshot = await getDocs(membersRef);
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

      // Fetch team groups
      const groupsRef = collection(firestore, 'teamGroups');
      const groupsQuery = query(groupsRef, firestoreOrderBy('orderIndex', 'asc'));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamGroup));

      setTeamMembers(members);
      setTeamGroups(groups);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const maxOrder = teamGroups.length > 0 ? Math.max(...teamGroups.map(g => g.orderIndex)) : -1;
      await createTeamGroup({
        name: newGroupName,
        description: newGroupDescription,
        orderIndex: maxOrder + 1,
      });

      toast({
        title: 'Success',
        description: 'Team group created successfully',
      });

      setNewGroupName('');
      setNewGroupDescription('');
      setIsGroupDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create team group',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroupName.trim()) return;

    try {
      await updateTeamGroup(editingGroup.id, {
        name: newGroupName,
        description: newGroupDescription,
      });

      toast({
        title: 'Success',
        description: 'Team group updated successfully',
      });

      setEditingGroup(null);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsGroupDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? Members will be moved to "Ungrouped".')) return;

    try {
      await deleteTeamGroup(groupId);
      toast({
        title: 'Success',
        description: 'Team group deleted successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team group',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (group: TeamGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setIsGroupDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsGroupDialogOpen(true);
  };

  // Drag and drop handlers for members
  const handleMemberDragStart = (member: TeamMember) => {
    setDraggedMember(member);
  };

  const handleMemberDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMemberDrop = async (targetGroupId: string | null, targetIndex: number) => {
    if (!draggedMember) return;

    try {
      const membersInTargetGroup = teamMembers
        .filter(m => (m.groupId || null) === targetGroupId)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

      // Remove dragged member from its current position
      const filteredMembers = membersInTargetGroup.filter(m => m.id !== draggedMember.id);

      // Insert at new position
      filteredMembers.splice(targetIndex, 0, draggedMember);

      // Create updates for all affected members
      const updates = filteredMembers.map((member, index) => ({
        id: member.id,
        groupId: targetGroupId,
        orderIndex: index,
      }));

      await batchUpdateTeamMemberPositions(updates);

      toast({
        title: 'Success',
        description: 'Team member position updated',
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team member position',
        variant: 'destructive',
      });
    } finally {
      setDraggedMember(null);
    }
  };

  // Drag and drop handlers for groups
  const handleGroupDragStart = (group: TeamGroup) => {
    setDraggedGroup(group);
  };

  const handleGroupDrop = async (targetIndex: number) => {
    if (!draggedGroup) return;

    try {
      const reorderedGroups = [...teamGroups];
      const currentIndex = reorderedGroups.findIndex(g => g.id === draggedGroup.id);

      // Remove from current position
      reorderedGroups.splice(currentIndex, 1);

      // Insert at new position
      reorderedGroups.splice(targetIndex, 0, draggedGroup);

      // Update order indices
      const updates = reorderedGroups.map((group, index) => ({
        id: group.id,
        orderIndex: index,
      }));

      await batchUpdateTeamGroupOrder(updates);

      toast({
        title: 'Success',
        description: 'Group order updated',
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update group order',
        variant: 'destructive',
      });
    } finally {
      setDraggedGroup(null);
    }
  };

  const getMembersInGroup = (groupId: string | null) => {
    return teamMembers
      .filter(m => (m.groupId || null) === groupId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  };

  const ungroupedMembers = getMembersInGroup(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold !font-headline">Team Management</h1>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Create Group
          </Button>
          <Button asChild>
            <Link href="/manage/team/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organize Your Team</CardTitle>
          <CardDescription>
            Drag and drop team members to reorder them or move them between groups. Drag groups to reorder them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Groups */}
          {teamGroups.map((group, groupIndex) => (
            <div
              key={group.id}
              draggable
              onDragStart={() => handleGroupDragStart(group)}
              onDragOver={handleMemberDragOver}
              onDrop={(e) => {
                e.stopPropagation();
                handleGroupDrop(groupIndex);
              }}
              className="border rounded-lg p-4 bg-muted/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div>
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(group)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {getMembersInGroup(group.id).map((member, memberIndex) => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={() => handleMemberDragStart(member)}
                    onDragOver={handleMemberDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleMemberDrop(group.id, memberIndex);
                    }}
                    className="flex items-center gap-3 p-3 bg-background border rounded-lg cursor-move hover:border-primary transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/manage/team/${member.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}

                {/* Drop zone for adding members to this group */}
                <div
                  onDragOver={handleMemberDragOver}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleMemberDrop(group.id, getMembersInGroup(group.id).length);
                  }}
                  className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors"
                >
                  Drop member here to add to {group.name}
                </div>
              </div>
            </div>
          ))}

          {/* Ungrouped Members */}
          {ungroupedMembers.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Ungrouped Members</h3>
              <div className="space-y-2">
                {ungroupedMembers.map((member, memberIndex) => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={() => handleMemberDragStart(member)}
                    onDragOver={handleMemberDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleMemberDrop(null, memberIndex);
                    }}
                    className="flex items-center gap-3 p-3 bg-background border rounded-lg cursor-move hover:border-primary transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/manage/team/${member.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {teamGroups.length === 0 && ungroupedMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members yet. Create a group or add members to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
            <DialogDescription>
              {editingGroup ? 'Update the group details below.' : 'Create a new team group to organize your members.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Management Team"
              />
            </div>
            <div>
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Input
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Brief description of this team"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}>
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
