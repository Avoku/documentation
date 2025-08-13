import { useState, useEffect } from 'react'

interface Metadata {
    downloads: number
    updates: {
        latest: {
            id: number
            version: string
            time: number
        }
    }
    reviews: {
        count: number
        stars: number
    }
}

export default function useMetadata() {
    const [metadata, setMetadata] = useState<Metadata | null>(null)

    useEffect(() => {
        const getMetadata = async () => {
            try {
                const response = await fetch(
                    'https://api.polymart.org/v1/getResourceInfo?resource_id=3636',
                )

                const json = await response.json()

                setMetadata(json.response.resource as Metadata)
            } catch (error) {
                console.error(
                    'Something went wrong while fetching metadata:',
                    error,
                )
            }
        }

        getMetadata()
    }, [])

    return metadata
}
