import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router';
import PageLoading from 'components/PageLoading';
const Forbidden = lazy(() => import('./Forbidden'));
const PageNotFound = lazy(() => import('./PageNotFound'));

export default function Customers(props) {
    return (
        <Suspense fallback={<PageLoading />}>
            <Outlet />
            <Routes>
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/notfound" element={<PageNotFound />} />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </Suspense>
    );
}
