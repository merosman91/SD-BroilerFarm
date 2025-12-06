import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Modal } from '../UI';
import { createInitialFeedInventory, FEED_INVENTORY_TYPES } from '../utils/helpers';

const InitialSetup = ({ inventoryItems, setInventoryItems, showNotify }) => {
    const [showSetup, setShowSetup] = useState(false);
    const [feedItems, setFeedItems] = useState(FEED_INVENTORY_TYPES);

    useEffect(() => {
        // التحقق من وجود مخزون العلف الأساسي
        const hasFeedInventory = inventoryItems.some(item => 
            item.category === 'أعلاف' && FEED_INVENTORY_TYPES.some(feed => feed.name === item.name)
        );
        
        if (!hasFeedInventory) {
            setTimeout(() => {
                setShowSetup(true);
            }, 2000);
        }
    }, [inventoryItems]);

    const setupFeedInventory = () => {
        const newFeedItems = createInitialFeedInventory();
        setInventoryItems([...inventoryItems, ...newFeedItems]);
        showNotify("✓ Feed inventory setup completed");
        setShowSetup(false);
    };

    return (
        <Modal isOpen={showSetup} onClose={() => setShowSetup(false)} title="Setup Feed Inventory">
            <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-yellow-600" size={20} />
                        <h3 className="font-bold text-yellow-800">Feed Inventory Required</h3>
                    </div>
                    <p className="text-sm text-yellow-700">
                        You need to set up feed inventory to track consumption in daily logs.
                    </p>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">Available Feed Types:</h4>
                    {feedItems.map(feed => (
                        <div key={feed.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Package className="text-blue-500" size={20} />
                                <div>
                                    <p className="font-medium text-gray-800">{feed.name}</p>
                                    <p className="text-xs text-gray-500">Code: {feed.code}</p>
                                </div>
                            </div>
                            <CheckCircle className="text-green-500" size={20} />
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <span className="font-bold">Initial stock:</span> 1000 kg per feed type<br />
                        <span className="font-bold">Min stock:</span> 200 kg<br />
                        <span className="font-bold">Price per kg:</span> 2.5 ج
                    </p>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button onClick={setupFeedInventory} className="flex-1" variant="success">
                        Setup Feed Inventory
                    </Button>
                    <Button onClick={() => setShowSetup(false)} variant="ghost">
                        Skip for Now
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default InitialSetup;
