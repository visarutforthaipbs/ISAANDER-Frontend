import { createClient } from '@wix/sdk';
import { posts as postsModule } from '@wix/blog';
import { members as membersModule } from '@wix/members';

const client = createClient({
  modules: { posts: postsModule, members: membersModule },
  auth: {
    getAuthHeaders: async () => ({
      headers: { Authorization: process.env.WIX_API_KEY as string },
    }),
  },
});

async function run() {
  const { posts } = await client.posts.listPosts({ paging: { limit: 20 } });
  const memberIds = [...new Set(posts?.map(p => p.memberId).filter(Boolean))];
  console.log('Member IDs from posts:', JSON.stringify(memberIds, null, 2));

  for (const mid of memberIds) {
    const m = await client.members.getMember(mid as string, { fieldsets: ['FULL'] });
    console.log('---');
    console.log('memberId:', mid);
    console.log('profile.slug:', m?.profile?.slug);
    console.log('name:', m?.contact?.firstName, m?.contact?.lastName);
  }
}
run().catch(console.error);
