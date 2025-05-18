import { deletePost, getAllPosts, updatePost } from '@/lib/posts';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Failed to fetch posts', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    await deletePost(postId);

    return NextResponse.json({ message: `Post ${postId} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ message: 'Failed to delete post', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { postId, ...updates } = await req.json();

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Filter out any properties that should not be updated directly (e.g., authorId, votes)
    const allowedUpdates: any = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.code !== undefined) allowedUpdates.code = updates.code;
    if (updates.answer !== undefined) allowedUpdates.answer = updates.answer;
    if (updates.tags !== undefined) allowedUpdates.tags = updates.tags;

    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    await updatePost(postId, allowedUpdates);

    return NextResponse.json({ message: `Post ${postId} updated successfully` });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ message: 'Failed to update post', error: error.message }, { status: 500 });
  }
}

// TODO: Implement PUT endpoint for editing post 