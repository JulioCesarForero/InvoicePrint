import { lazy, Suspense } from "react";
import PageLoading from 'src/components/PageLoading';
const PageLoader = (props) => {
    const LazyComponent = lazy(() => import(`pages/${props.path}`));
    return (
        <Suspense
            fallback={
                <div className="h-full text-center flex align-items-center justify-content-center">
                    <PageLoading />
                </div>
            }
        >
            <LazyComponent />
        </Suspense>
    );
};
export default PageLoader;