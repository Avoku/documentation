import React, { useState } from 'react'
import { Config } from './utils'

interface Props {
    config: Config & { elementScale?: number }
    onChange: (field: Partial<Config & { elementScale?: number }>) => void
}

export default function ConfigField({ config, onChange }: Props) {
    const [collapsed, setCollapsed] = useState(true)

    return (
        <div className="nx-mt-4 nx-px-4 nx-py-2 nx-bg-white dark:nx-bg-dark nx-border dark:nx-border-neutral-800 nx-rounded-lg nx-overflow-hidden nx-shadow">
            <div
                className="nx-uppercase nx-font-bold nx-cursor-pointer"
                onClick={() => setCollapsed(!collapsed)}
            >
                {config.key}
            </div>

            <div
                className={`${collapsed ? 'nx-hidden' : 'nx-flex nx-flex-col'}`}
            >
                <label>Size:</label>
                <input
                    className="nx-full nx-px-6 nx-py-2 nx-border nx-text-sm nx-rounded nx-border-neutral-800"
                    type="number"
                    value={config.size}
                    onChange={(e) => onChange({ size: Number(e.target.value) })}
                />

                <label>Scale:</label>
                <input
                    className="nx-full nx-px-6 nx-py-2 nx-border nx-rounded nx-border-neutral-800"
                    type="number"
                    step={0.1}
                    value={config.elementScale || 1}
                    onChange={(e) =>
                        onChange({ elementScale: Number(e.target.value) })
                    }
                />

                <label>Position X:</label>
                <input
                    className="nx-full nx-px-6 nx-py-2 nx-border nx-rounded nx-border-neutral-800"
                    type="number"
                    value={config.pixels[0]}
                    onChange={(e) =>
                        onChange({
                            pixels: [Number(e.target.value), config.pixels[1]],
                        })
                    }
                />

                <label>Position Y:</label>
                <input
                    className="nx-full nx-px-6 nx-py-2 nx-border nx-rounded nx-border-neutral-800"
                    type="number"
                    value={config.pixels[1]}
                    onChange={(e) =>
                        onChange({
                            pixels: [config.pixels[0], Number(e.target.value)],
                        })
                    }
                />

                {config.key.toLowerCase() !== 'skin' && (
                    <>
                        <label>Color (R,G,B)</label>
                        <input
                            className="nx-full nx-px-6 nx-py-2 nx-border nx-rounded nx-border-neutral-800"
                            type="text"
                            value={config.color?.join(',') || ''}
                            onChange={(e) =>
                                onChange({
                                    color: e.target.value
                                        .split(',')
                                        .map(Number) as [
                                        number,
                                        number,
                                        number,
                                    ],
                                })
                            }
                        />
                    </>
                )}
            </div>
        </div>
    )
}
