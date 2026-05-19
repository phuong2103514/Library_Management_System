import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/homeAdmin',
    component: () => import('../views/HomeAdmin.vue'),
    children: [
      {
        path: 'managementBook',
        name: 'ManagementBook',
        component: () => import('../views/ManagementBook.vue'),
      },
      {
        path: 'managementTextBook',
        name: 'ManagementTextBook',
        component: () => import('../views/ManagementTextBook.vue'),
      },
      {
        path: 'managementBorrowBook',
        component: () => import('../views/ManagementBorrowBook.vue'),
      },
      {
        path: 'managementLibraryCard',
        name: 'ManagementLibraryCard',
        component: () => import('../views/ManagementLibraryCard.vue'),
      },
      {
        path: 'thesis',
        name: 'Thesis',
        component: () => import('../views/ManagementThesis.vue'),
      },
      {
        path: 'managementStudyRoom',
        name: 'ManagementStudyRoom',
        component: () => import('../views/ManagementStudyRoom.vue'),
      },
      {
        path: 'statisticsBook',
        name: 'StatisticsBook',
        component: () => import('../views/StatisticsBook.vue'),
      },
      {
        path: 'statisticsBorrowBook',
        name: 'StatisticsBorrowBook',
        component: () => import('../views/StatisticsBorrowBook.vue'),
      },
      {
        path: 'statisticsBorrowBookWithReader',
        name: 'StatisticsBorrowBookWithReader',
        component: () => import('../views/StatisticsBorrowBookWithReader.vue'),
      },
      {
        path: 'statisticsBookDocument',
        name: 'StatisticsBookDocument',
        component: () => import('../views/StatisticsBookDocument.vue'),
      },
      {
        path: 'statisticsRoom',
        name: 'StatisticsRoom',
        component: () => import('../views/StatisticsRoom.vue'),
      },
      {
        path: 'statisticsBookingRoom',
        name: 'StatisticsBookingRoom',
        component: () => import('../views/StatisticsBookingRoom.vue'),
      },
      {
        path: 'statisticsRoomWithReader',
        name: 'StatisticsRoomWithReader',
        component: () => import('../views/StatisticsBookingRoomWithReader.vue'),
      },
      {
        path: 'reportStatistics',
        name: 'ReportStatistics',
        component: () => import('../views/ReportStatistics.vue'),
      },
      {
        path: 'submitStatistics',
        name: 'SubmitStatistics',
        component: () => import('../views/SubmitStatistics.vue'),
      },
      {
        path: 'statisticsThesis',
        name: 'StatisticsThesis',
        component: () => import('../views/StatisticsThesis.vue'),
      },
      {
        path: 'statisticsEssay',
        name: 'StatisticsEssay',
        component: () => import('../views/StatisticsEssay.vue'),
      },
      {
        path: '',
        redirect: 'managementLibraryCard',
      },
    ],
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('../views/Library.vue'),
  },
  {
    path: '/detailBook/:id',
    name: 'DetailBook',
    component: () => import('../views/DetailBook.vue'),
    props: true,
  },
  {
    path: '/myBook',
    name: 'MyBook',
    component: () => import('../views/MyBook.vue'),
  },
  {
    path: '/libraryCard',
    name: 'LibraryCard',
    component: () => import('../views/LibraryCard.vue'),
  },
  {
    path: '/studyRoom',
    name: 'StudyRoom',
    component: () => import('../views/StudyRoom.vue'),
  },
  {
    path: '/myShelf',
    name: 'MyShelf',
    component: () => import('../views/MyShelf.vue'),
  },
  {
    path: '/importBookApi',
    name: 'importBookApi',
    component: () => import('../views/ImportBookApi.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('_id');
  const role = localStorage.getItem('role');

  if (to.path === '/' && isLoggedIn) {
    if (role === 'Admin') return next('/homeAdmin/managementBorrowBook');
    return next('/home');
  }

  const publicPages = ['/', '/signup'];
  const isPublic = publicPages.includes(to.path);

  if (!isLoggedIn && !isPublic) {
    return next('/');
  }

  if (to.path.startsWith('/homeAdmin') && role !== 'Admin' && role !== 'Manager') {
    return next('/home');
  }

  next();
});

export default router;
