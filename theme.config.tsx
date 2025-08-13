import Logo from '~/components/logo'
import Statistics from '~/components/statistics'

export default {
    logo: <Logo />,
    primaryHue: 193,
    useNextSeoProps() {
        return {
            titleTemplate: '%s | Avoku',
        }
    },
    footer: {
        text: 'Have a cookie! 🍪',
    },
    project: {
        link: 'https://github.com/avoku/documentation',
    },
    chat: {
        link: 'https://discord.gg/zKe7dW7Z3T',
    },
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    toc: {
        extraContent: <Statistics />,
    },
    nextThemes: {
        defaultTheme: 'dark',
    },
}
