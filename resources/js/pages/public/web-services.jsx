import PublicLayout from '@/layouts/public-layout';
import Pagination from '@/components/pagination';
import { WebServiceCard } from '@/components/public/web-service-card';

export default function WebServices({ webServices }) {
    return (
        <PublicLayout title="Katalog Jasa Web">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="mb-6 text-3xl font-semibold">
                    Katalog Jasa Web
                </h1>
                <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {webServices.data.map((item, index) => (
                        <WebServiceCard
                            key={item.id}
                            item={item}
                            featured={index === 1}
                        />
                    ))}
                </div>
                <div className="mt-6">
                    <Pagination links={webServices.links} />
                </div>
            </div>
        </PublicLayout>
    );
}
