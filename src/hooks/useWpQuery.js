import { useQuery } from '@tanstack/react-query';
import { wp } from '../lib/wp.js';

const FIVE_MIN = 5 * 60 * 1000;

const opts = { staleTime: FIVE_MIN, refetchOnWindowFocus: false };

export const useCategories = () =>
  useQuery({ queryKey: ['wp', 'categories'], queryFn: wp.categories, ...opts });

export const usePages = () =>
  useQuery({ queryKey: ['wp', 'pages'], queryFn: wp.pages, ...opts });

export const usePage = (id) =>
  useQuery({
    queryKey: ['wp', 'page', id],
    queryFn: () => wp.page(id),
    enabled: id != null,
    ...opts,
  });

export const usePosts = () =>
  useQuery({ queryKey: ['wp', 'posts'], queryFn: wp.posts, ...opts });

export const usePost = (id) =>
  useQuery({
    queryKey: ['wp', 'post', id],
    queryFn: () => wp.post(id),
    enabled: id != null,
    ...opts,
  });

export const usePrimaryMenu = () =>
  useQuery({
    queryKey: ['wp', 'menu', 'primary'],
    queryFn: wp.primaryMenu,
    ...opts,
  });
