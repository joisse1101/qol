import { Tabs, type TabItem } from "@joisse1101/ui-library";
import { useEffect, useState } from "react";
import { TrackerTab } from "@/components/partials/goalTracker/TrackerTab";
import { generateUUID } from '@/utils/numbers';
import { DeleteGoalModal } from "@/components/partials/goalTracker/DeleteGoalModal";
import { useMiniTool, useMiniToolInstanceIds } from "@/hooks/useMiniTool";

export default function GoalTracker() {
    const { instanceIds, createInstance, deleteInstance, isLoading } = useMiniToolInstanceIds('goalTracker');
    const [activeTab, setActiveTab] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    // Synchronize activeTab when instanceIds load or change
    useEffect(() => {
        if (isLoading) return;

        if (instanceIds.length === 0) {
            // Seeding default tab if none exist
            const newId = generateUUID();
            createInstance(newId, {});
            setActiveTab(newId);
        } else if (!activeTab || !instanceIds.includes(activeTab)) {
            setActiveTab(instanceIds[0]);
        }
    }, [instanceIds, isLoading, activeTab]);

    const handleAddTab = async () => {
        const newId = generateUUID();
        await createInstance(newId, {});
        setActiveTab(newId);
    };

    const handleDeleteTab = async (tabId: string) => {
        if (instanceIds.length <= 1) {
            alert("You cannot delete the last remaining tab.");
            return;
        }
        await deleteInstance(tabId);

        const nextInstanceIds = instanceIds.filter((id) => id !== tabId);
        if (activeTab === tabId) {
            setActiveTab(nextInstanceIds[0]);
        }
    };

    function triggerDeleteModal(tabId: string) {
        setActiveTab(tabId);
        setIsDeleteModalOpen(true);
    }

    if (isLoading || !activeTab) {
        return null; // Prevent UI rendering until IndexedDB query finishes
    }

    const tabItems: TabItem[] = instanceIds.map((id) => ({
        id: id,
        label: <TrackerTabLabel id={id} />,
        content: <TrackerTab id={id} />,
    }));

    return (
        <div className="app-wrapper">
            <Tabs
                tabs={tabItems}
                activeId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId)}
                onTabAdd={handleAddTab}
                onTabDelete={instanceIds.length > 1 ? triggerDeleteModal : undefined}
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
    );
}

const TrackerTabLabel = ({ id }: { id: string }) => {
    const { toolData } = useMiniTool('goalTracker', id);
    return <span>{toolData.trackerState?.goalTitle || `Your Goal`}</span>;
};