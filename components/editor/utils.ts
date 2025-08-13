import * as yaml from 'js-yaml'

export interface Config {
    key: string
    size: number
    color?: [number, number, number] // rgb values
    pixels: [number, number] // offset values
}

interface RawYaml {
    [key: string]: string
}

export async function loadYamlConfig(url: string): Promise<Config[]> {
    const text = await fetch(url).then((res) => res.text())
    const parsed = yaml.load(text) as RawYaml

    const keys = Array.from(
        new Set(Object.keys(parsed).map((k) => k.split('-')[0])),
    )

    return keys.map((key) => ({
        key,
        size: Number(parsed[`${key}-size`] ?? 0),
        color: parsed[`${key}-color`]
            ? (parsed[`${key}-color`].split(',').map(Number) as [
                  number,
                  number,
                  number,
              ])
            : [255, 255, 255],
        pixels: parsed[`${key}-pixels`]
            ? (parsed[`${key}-pixels`].split(',').map(Number) as [
                  number,
                  number,
              ])
            : [0, 0],
    }))
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()

        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

export async function loadFont(name: string, url: string): Promise<string> {
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const font = new FontFace(name, buffer)

    await font.load()

    document.fonts.add(font)

    return name
}
