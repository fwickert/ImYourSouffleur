import React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { Home24Filled, Library24Filled, Settings24Filled } from '@fluentui/react-icons';

const Sidebar: React.FC = () => {
    const menuItems = [
        { icon: <Home24Filled />, label: 'Home' },
        { icon: <Library24Filled />, label: 'Samples' },
        { icon: <Settings24Filled />, label: 'Settings' },
    ];

    return (
        <aside style={{ width: '60px', background: '#1b1b1b', color: 'white', padding: '10px' }}>
            {menuItems.map((item, index) => (
                <Tooltip content={item.label} relationship="label" key={index}>
                    <Button icon={item.icon} appearance="subtle" style={{ margin: '10px 0' }} />
                </Tooltip>
            ))}
        </aside>
    );
};

export default Sidebar;  