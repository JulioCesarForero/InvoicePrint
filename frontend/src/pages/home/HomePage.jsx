
import { useState } from 'react';
import { Title } from 'components/Title';

export default function HomePage() {
	
	const [pageReady, setPageReady] = useState(true);
	return (
		<main id="HomePage" className="main-page">
<section className="page-section bg-light p-3" >
    <div className="container-fluid">
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-full md:col-span-4 comp-grid" >
                <Title title="Home"   titleClass="text-xl font-bold text-primary" subTitleClass="text-gray-500"      separator={false} />
            </div>
        </div>
    </div>
</section>

		</main>
	);
}
