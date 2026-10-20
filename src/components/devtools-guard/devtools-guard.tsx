import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LogoMark } from '@/components/layout/app-logo/LogoMark';
import { SOCIAL_URLS } from '@/constants/social-links';
import './devtools-guard.scss';

const DETECTION_INTERVAL = 800;
const DIMENSION_THRESHOLD = 160;
const DEVTOOLS_GUARD_ENABLED = false;
const SocialIcon = ({ name }: { name: string }) => {
    const paths: Record<string, React.ReactNode> = {
        YouTube: <path d='M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z' />,
        TikTok: <path d='M15.5 3c.4 2.1 1.6 3.6 3.5 4.2v3.1c-1.3-.1-2.5-.5-3.5-1.2v6.7a5.2 5.2 0 1 1-4.5-5.2v3.2a2.1 2.1 0 1 0 1.4 2V3h3.1z' />,
        Facebook: <path d='M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H7.2v3.2H10V21h3.4z' />,
    };

    return <svg viewBox='0 0 24 24' aria-hidden='true'>{paths[name]}</svg>;
};

const SOCIAL_LINKS = [
    { label: 'YouTube', href: SOCIAL_URLS.youtube },
    { label: 'TikTok', href: SOCIAL_URLS.tiktok },
    { label: 'Facebook', href: SOCIAL_URLS.facebook },
];

function detectDevToolsOpen(initialViewport?: { width: number; height: number; outerWidth: number; outerHeight: number }) {
    if (typeof window === 'undefined') return false;

    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isLarge = widthDiff > DIMENSION_THRESHOLD || heightDiff > DIMENSION_THRESHOLD;
    const viewportChangedByEmulation =
        initialViewport &&
        window.outerWidth === initialViewport.outerWidth &&
        window.outerHeight === initialViewport.outerHeight &&
        (Math.abs(window.innerWidth - initialViewport.width) > DIMENSION_THRESHOLD ||
            Math.abs(window.innerHeight - initialViewport.height) > DIMENSION_THRESHOLD);

    let isOpened = isLarge || !!viewportChangedByEmulation;

    try {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = performance.now();
        if (end - start > 100) isOpened = true;
    } catch {
        // ignore
    }

    return isOpened;
}

const DevToolsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [devtoolsOpen, setDevtoolsOpen] = useState(false);
    const wasOpen = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!DEVTOOLS_GUARD_ENABLED) return;

        const initialViewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
        };

        const check = () => {
            const open = detectDevToolsOpen(initialViewport);
            if (open && !devtoolsOpen) {
                setDevtoolsOpen(true);
            }
            if (!open && wasOpen.current) {
                window.location.reload();
            }
            wasOpen.current = open;
        };

        const intervalId = window.setInterval(check, DETECTION_INTERVAL);
        window.addEventListener('resize', check, true);
        check();

        const handleKeyDown = (event: KeyboardEvent) => {
            const keys = [
                'F12',
                'I',
                'J',
                'C',
                'U',
                'M',
            ];
            const lowerKey = event.key.toUpperCase();
            if (
                event.key === 'F12' ||
                ((event.ctrlKey || event.metaKey) && event.shiftKey && keys.includes(lowerKey)) ||
                ((event.ctrlKey || event.metaKey) && lowerKey === 'U')
            ) {
                event.preventDefault();
                setDevtoolsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('resize', check, true);
            window.removeEventListener('keydown', handleKeyDown, true);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, []);

    const overlay = useMemo(
        () => (
            <main className='devtools-guard' role='alertdialog' aria-modal='true'>
                <div className='devtools-guard__inner'>
                    <div className='devtools-guard__logo'>
                        <LogoMark height={72} />
                    </div>
                    <h1>Developer tools detected</h1>
                    <p>The app is protected while developer tools are open.</p>
                    <p className='devtools-guard__instruction'>
                        Close Developer Tools completely, then reload this page. The protection will remain active until
                        the tools are closed.
                    </p>
                    <div className='devtools-guard__socials' aria-label='CEOTRADER social links'>
                        {SOCIAL_LINKS.map(link => (
                            <a key={link.label} href={link.href} target='_blank' rel='noreferrer'>
                                <SocialIcon name={link.label} />
                                <span className='sr-only'>{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </main>
        ),
        []
    );

    return <>{DEVTOOLS_GUARD_ENABLED && devtoolsOpen ? overlay : children}</>;
};

export default DevToolsGuard;
