import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
    const current_theme = localStorage.getItem('theme') ?? 'dark';
    const { ui } = useStore() ?? {
        ui: {
            setDevice: () => {},
        },
    };
    const { setDevice } = ui;
    const { isDesktop, isMobile, isTablet } = useDevice();

    useEffect(() => {
        const body = document.querySelector('body');
        if (!body) return;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(current_theme === 'light' ? 'light' : 'dark');
        body.classList.remove('theme--light', 'theme--dark');
        body.classList.add(current_theme === 'light' ? 'theme--light' : 'theme--dark');
    }, [current_theme]);

    useEffect(() => {
        if (isMobile) {
            setDevice('mobile');
        } else if (isTablet) {
            setDevice('tablet');
        } else {
            setDevice('desktop');
        }
    }, [isDesktop, isMobile, isTablet, setDevice]);

    return <div className='main-body'>{children}</div>;
};

export default MainBody;
