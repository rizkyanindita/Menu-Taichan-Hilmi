import MenuItem from './MenuItem';

export default function MenuGrid({ items }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map(item => (
                <MenuItem key={item.id} item={item} />
            ))}
        </div>
    )
}
