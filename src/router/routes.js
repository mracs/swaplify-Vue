export default [
  {
    path: '*',
    redirect: { name: 'Python dict to JSON' },
  },
  {
    path: '/source/:source',
    name: 'Python dict to JSON',
    component: () => import('@/views/Home.vue'),
    props: true,
    meta: { icon: 'mdi-home' },
  },
];
