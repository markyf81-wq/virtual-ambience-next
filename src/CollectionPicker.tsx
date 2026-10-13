import { collections, type SoundCollection } from './data';
import SoundIcon from './SoundIcon';

export default function CollectionPicker({
  label,
  value,
  onChange,
  counts,
}: {
  label: string;
  value: SoundCollection;
  onChange: (collection: SoundCollection) => void;
  counts?: Partial<Record<SoundCollection, number>>;
}) {
  return (
    <div className="collection-picker" data-collection={value}>
      <span className="collection-label">{label}</span>
      <div role="group" aria-label={label}>
        {collections.map((collection) => (
          <button
            key={collection.id}
            className={value === collection.id ? 'selected' : ''}
            aria-pressed={value === collection.id}
            onClick={() => onChange(collection.id)}
          >
            <SoundIcon name={collection.icon} size={15} />
            <span>{collection.name}</span>
            {counts?.[collection.id] !== undefined && (
              <small className="collection-count">{counts[collection.id]}</small>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
