
import { useEffect, useState, useRef } from 'react';

export function InfiniteScroll(props) {
    const [lastElement, setLastElement] = useState(null);
    const observer = useRef(
        new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    props.onScrollEnd();
                }
            })
    );
    useEffect(() => {
        const currentElement = lastElement;
        const currentObserver = observer.current;

        if (currentElement) {
            currentObserver.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [lastElement]);
    return (
        <div ref={setLastElement}></div>
    )
}
