import { ComponentProps, ReactNode, useMemo } from 'react';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import RootStore from '@/stores/root-store';
import { LegacyLogout1pxIcon, LegacyTheme1pxIcon } from '@deriv/quill-icons/Legacy';
import { useTranslations } from '@deriv-com/translations';
import { SOCIAL_URLS } from '@/constants/social-links';

const TikTokIcon = () => (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M15.5 3c.4 2.1 1.6 3.6 3.5 4.2v3.1c-1.3-.1-2.5-.5-3.5-1.2v6.7a5.2 5.2 0 1 1-4.5-5.2v3.2a2.1 2.1 0 1 0 1.4 2V3h3.1z' />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H7.2v3.2H10V21h3.4z' />
    </svg>
);

const YouTubeIcon = () => (
    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z' />
    </svg>
);

export type TSubmenuSection = 'accountSettings' | 'cashier' | 'reports';

//IconTypes
type TMenuConfig = {
    LeftComponent: React.ElementType;
    RightComponent?: ReactNode;
    as: 'a' | 'button';
    href?: string;
    label: ReactNode;
    onClick?: () => void;
    removeBorderBottom?: boolean;
    submenu?: TSubmenuSection;
    target?: ComponentProps<'a'>['target'];
    isActive?: boolean;
    appearance?: boolean;
    theme?: 'light' | 'dark';
    variant?: 'logout';
}[];

const useMobileMenuConfig = (
    client?: RootStore['client'],
    onLogout?: () => void,
    enableThemeToggle: boolean = true
) => {
    const { localize } = useTranslations();
    const { is_dark_mode_on } = useThemeSwitcher();

    const menuConfig = useMemo((): TMenuConfig[] => {

        return [
            [
                {
                    as: 'a',
                    label: 'TikTok',
                    LeftComponent: TikTokIcon,
                    href: SOCIAL_URLS.tiktok,
                    target: '_blank',
                },
                {
                    as: 'a',
                    label: 'YouTube',
                    LeftComponent: YouTubeIcon,
                    href: SOCIAL_URLS.youtube,
                    target: '_blank',
                },
                {
                    as: 'a',
                    label: 'Facebook',
                    LeftComponent: FacebookIcon,
                    href: SOCIAL_URLS.facebook,
                    target: '_blank',
                },
            ] as TMenuConfig,
            [
                // Conditionally include theme toggle based on brand config
                enableThemeToggle && {
                    as: 'button',
                    label: localize('Dark theme'),
                    LeftComponent: LegacyTheme1pxIcon,
                    appearance: true,
                    theme: is_dark_mode_on ? 'dark' : 'light',
                },
            ].filter(Boolean) as TMenuConfig,
            [
                client?.is_logged_in &&
                    onLogout && {
                        as: 'button',
                        label: localize('Log out'),
                        LeftComponent: LegacyLogout1pxIcon,
                        onClick: onLogout,
                        removeBorderBottom: true,
                        variant: 'logout',
                    },
            ].filter(Boolean) as TMenuConfig,
        ].filter(section => section.length > 0);
    }, [
        client,
        onLogout,
        is_dark_mode_on,
        localize,
        enableThemeToggle, // [AI] Added to recalculate menu when theme toggle config changes
    ]);

    // [AI] Check if menu has any items to determine if mobile menu should be shown
    const hasMenuItems = menuConfig.some(section => section.length > 0);
    // [/AI]

    return {
        config: menuConfig,
        // [AI] Return flag indicating if menu has any items
        hasMenuItems,
        // [/AI]
    };
};

export default useMobileMenuConfig;
