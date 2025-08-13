import { useState, useRef, useEffect, useCallback } from 'react'
import { Config, loadYamlConfig, loadImage, loadFont } from './utils'
import yaml from 'js-yaml'

import ConfigField from './field'

export default function StatsEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [config, setConfig] = useState<Config[]>([])
    const [background, setBackground] = useState<HTMLImageElement | null>(null)
    const [fontName, setFontName] = useState('')
    const [skin, setSkin] = useState<HTMLImageElement | null>(null)

    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0])

    // hacks ez
    const fontInputRef = useRef<HTMLInputElement>(null)
    const bgInputRef = useRef<HTMLInputElement>(null)
    const ymlInputRef = useRef<HTMLInputElement>(null)

    // mount config
    useEffect(() => {
        async function init() {
            const cfg = await loadYamlConfig('/assets/config.yml')
            setConfig(cfg.map((c) => ({ ...c, elementScale: 1 })))

            setBackground(await loadImage('/assets/default.png'))
            setFontName(await loadFont('Minecraft', '/assets/minecraft.otf'))

            const skinConfig = cfg.find((c) => c.key.toLowerCase() === 'skin')

            if (skinConfig) {
                const skinSize = skinConfig.size || 400

                setSkin(
                    await loadImage(
                        `https://vzge.me/full/${skinSize}/naibuu.png`,
                    ),
                )
            }
        }
        init()
    }, [])

    // draw canvas
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, 960, 540)

        // bg
        if (background) {
            ctx.drawImage(background, 0, 0, 960, 540)
        } else {
            ctx.fillStyle = '#222'
            ctx.fillRect(0, 0, 960, 540)
        }

        // draw config
        config.forEach((c, i) => {
            if (c.key.toLowerCase() === 'skin' && skin) {
                const aspect = skin.naturalWidth / skin.naturalHeight
                const w = c.size * aspect * c.elementScale
                const h = c.size * c.elementScale

                ctx.drawImage(skin, c.pixels[0], c.pixels[1], w, h)

                if (i === dragIndex) {
                    ctx.strokeStyle = 'blue'
                    ctx.lineWidth = 2
                    ctx.strokeRect(c.pixels[0], c.pixels[1], w, h)
                }
            } else {
                const textSize = c.size * c.elementScale

                ctx.font = `${textSize}px ${fontName || 'sans-serif'}`
                ctx.fillStyle = `rgb(${c.color?.join(',')})`
                ctx.fillText(c.key, c.pixels[0], c.pixels[1])

                if (i === dragIndex) {
                    const width = ctx.measureText(c.key).width

                    ctx.strokeStyle = 'blue'
                    ctx.lineWidth = 2
                    ctx.strokeRect(
                        c.pixels[0],
                        c.pixels[1] - textSize,
                        width,
                        textSize,
                    )
                }
            }
        })
    }, [background, config, fontName, skin, dragIndex])

    const getMousePos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return null

        const rect = canvas.getBoundingClientRect()

        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        }
    }

    const snapToGrid = (value: number) => Math.round(value / 4) * 4

    const updateConfigField = useCallback(
        (index: number, field: Partial<Config & { elementScale?: number }>) => {
            setConfig((prev) => {
                const arr = [...prev]
                arr[index] = { ...arr[index], ...field }
                return arr
            })
        },
        [],
    )

    const handleMouseDown = (e: React.MouseEvent) => {
        const pos = getMousePos(e)
        if (!pos) return

        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        for (let i = config.length - 1; i >= 0; i--) {
            const c = config[i]
            if (c.key.toLowerCase() === 'skin' && skin) {
                const aspect = skin.naturalWidth / skin.naturalHeight
                const w = c.size * aspect * c.elementScale
                const h = c.size * c.elementScale

                if (
                    pos.x >= c.pixels[0] &&
                    pos.x <= c.pixels[0] + w &&
                    pos.y >= c.pixels[1] &&
                    pos.y <= c.pixels[1] + h
                ) {
                    setDragIndex(i)
                    setDragOffset([pos.x - c.pixels[0], pos.y - c.pixels[1]])
                    break
                }
            } else {
                const textSize = c.size * c.elementScale

                ctx.font = `${textSize}px ${fontName || 'sans-serif'}`

                const width = ctx.measureText(c.key).width

                if (
                    pos.x >= c.pixels[0] &&
                    pos.x <= c.pixels[0] + width &&
                    pos.y <= c.pixels[1] &&
                    pos.y >= c.pixels[1] - textSize
                ) {
                    setDragIndex(i)
                    setDragOffset([pos.x - c.pixels[0], pos.y - c.pixels[1]])
                    break
                }
            }
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragIndex === null) return

        const pos = getMousePos(e)
        if (!pos) return

        updateConfigField(dragIndex, {
            pixels: [
                snapToGrid(pos.x - dragOffset[0]),
                snapToGrid(pos.y - dragOffset[1]),
            ],
        })
    }

    // Import font
    const handleFontImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const fontUrl = URL.createObjectURL(file)
        loadFont(file.name.replace(/\.[^/.]+$/, ''), fontUrl).then(setFontName)
    }

    // Import bg
    const handleBgImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const bgUrl = URL.createObjectURL(file)
        loadImage(bgUrl).then(setBackground)
    }

    // Import
    const handleYmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const data = yaml.load(ev.target?.result as string) as Config[]
                setConfig(data.map((c) => ({ ...c, elementScale: 1 })))
            } catch (err) {
                alert('Invalid YAML file')
            }
        }
        reader.readAsText(file)
    }

    // Export
    const handleYmlExport = () => {
        const blob = new Blob([yaml.dump(config)], { type: 'text/yaml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'config.yml'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="nx-flex nx-flex-col">
            <input
                ref={fontInputRef}
                type="file"
                accept=".otf,.ttf"
                className="nx-hidden"
                onChange={handleFontImport}
            />

            <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="nx-hidden"
                onChange={handleBgImport}
            />

            <input
                ref={ymlInputRef}
                type="file"
                accept=".yml,.yaml"
                className="nx-hidden"
                onChange={handleYmlImport}
            />

            <canvas
                ref={canvasRef}
                width={960}
                height={540}
                className="nx-w-full nx-h-auto nx-mt-6"
                style={{
                    cursor: dragIndex !== null ? 'grabbing' : 'default',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDragIndex(null)}
            />

            <div className="nx-mt-4 nx-flex nx-flex-col">
                <div className="nx-flex nx-gap-2 nx-mb-4">
                    <button
                        onClick={() => fontInputRef.current?.click()}
                        className="nx-px-4 nx-py-2 nx-bg-white dark:nx-bg-dark nx-border dark:nx-border-neutral-800 nx-rounded-lg"
                    >
                        Import Font
                    </button>
                    <button
                        onClick={() => bgInputRef.current?.click()}
                        className="nx-px-4 nx-py-2 nx-bg-white dark:nx-bg-dark nx-border dark:nx-border-neutral-800 nx-rounded-lg"
                    >
                        Import Background
                    </button>
                    <button
                        onClick={() => ymlInputRef.current?.click()}
                        className="nx-px-4 nx-py-2 nx-bg-white dark:nx-bg-dark nx-border dark:nx-border-neutral-800 nx-rounded-lg"
                    >
                        Import YML
                    </button>
                    <button
                        onClick={handleYmlExport}
                        className="nx-px-4 nx-py-2 nx-bg-white dark:nx-bg-dark nx-border dark:nx-border-neutral-800 nx-rounded-lg"
                    >
                        Export YML
                    </button>
                </div>

                {config.map((c, i) => (
                    <ConfigField
                        key={c.key}
                        config={c}
                        onChange={(field) => updateConfigField(i, field)}
                    />
                ))}
            </div>
        </div>
    )
}
