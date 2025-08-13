import { Download } from 'lucide-react'
import useMetadata from '~/hooks/useMetadata'

export default function Statistics() {
    const metadata = useMetadata()

    if (!metadata) {
        // Show nothing
        return null
    }

    return (
        <div
            style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#01aede20',
                borderRadius: '4px',
            }}
        >
            <span
                style={{
                    verticalAlign: 'bottom',
                    gap: 2,
                    fontWeight: 600,
                    color: '#01aede',
                }}
            >
                <Download size={16} />
                Downloaded over {metadata.downloads} times!
            </span>
        </div>
    )
}
