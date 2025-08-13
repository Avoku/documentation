interface Props {
    id: string
}

export default function VideoEmbed({ id }: Props) {
    return (
        <iframe
            width={560}
            height={315}
            src={'https://www.youtube.com/embed/' + id}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen={true}
            style={{ margin: '12px 0' }}
        />
    )
}
