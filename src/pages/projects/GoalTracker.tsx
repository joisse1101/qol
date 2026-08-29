import { Tabs, type TabItem } from "@joisse1101/ui-library";
import { useEffect, useState } from "react";
import { TrackerTab } from "@/components/partials/goalTracker/TrackerTab";
import { generateUUID } from '@/utils/numbers';
import { DeleteGoalModal } from "@/components/partials/goalTracker/DeleteGoalModal";
import { useMiniTool } from "@/context/AppContext";

export default function GoalTracker() {
    const { toolData, setToolData } = useMiniTool('goalTracker');
    const tabIds = Object.keys(toolData || {});
    const [activeTab, setActiveTab] = useState<string>(tabIds[0]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const tabItems: TabItem[] = tabIds.map((id) => ({
        id: id,
        label: toolData[id]?.trackerState?.goalTitle || 'Your Goal',
        content: <TrackerTab id={id} />,
    }));

    function handleAddTab() {
        const newId = generateUUID();
        setToolData({
            ...toolData,
            [newId]: {},
        });
        setActiveTab(newId);
    }

    useEffect(() => {
        if (tabIds.length === 0) {
            handleAddTab();
        }
        if (!tabIds.includes(activeTab)) {
            setActiveTab(tabIds[0]);
        }
    }, [tabIds]);

    function triggerDeleteModal(tabId: string) {
        setActiveTab(tabId);
        setIsDeleteModalOpen(true);
    }

    function handleDeleteTab(tabId: string) {
        if (tabIds.length === 1) {
            alert("You cannot delete the last remaining tab.");
            return;
        }
        const newTabIds = tabIds.filter(id => id !== tabId);
        setToolData(Object.fromEntries(newTabIds.map(id => [id, toolData[id]])));
        if (activeTab === tabId) {
            setActiveTab(newTabIds[0]);
        }
    }
    return (
        <div className="app-wrapper">
            <Tabs
                tabs={tabItems}
                activeId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId)}
                onTabAdd={handleAddTab}
                onTabDelete={tabIds.length > 1 ? triggerDeleteModal : undefined}
            />
            <DeleteGoalModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={() => {
                    handleDeleteTab(activeTab);
                    setIsDeleteModalOpen(false);
                }}
            />
        </div>
    )
};