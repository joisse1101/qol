import { Tabs, type TabItem } from "@joisse1101/ui-library";
import { useEffect, useState } from "react";
import { TrackerTab } from "@/components/partials/goalTracker/TrackerTab";
import { getStorageItem } from "@/utils/storage";
import { useGoalTitle, deleteGoalStorage } from "@/hooks/useGoalTracker";
import { generateUUID } from '@/utils/numbers';
import { DeleteGoalModal } from "@/components/partials/goalTracker/DeleteGoalModal";

const STORAGE_KEY = 'goal_tracker_tab_ids';

export default function GoalTracker() {
    const [tabIds, setTabIds] = useState<string[]>(() =>
        getStorageItem(STORAGE_KEY, [generateUUID()]));
    const [activeTab, setActiveTab] = useState<string>(tabIds[0]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabIds));
    }, [tabIds]);


    const tabItems: TabItem[] = tabIds.map((id) => ({
        id: id,
        label: <DynamicTabLabel id={id} />,
        content: <TrackerTab id={id} />,
    }));

    function handleAddTab() {
        const newId = generateUUID();
        setTabIds([...tabIds, newId]);
        setActiveTab(newId);
    }

    function triggerDeleteModal(tabId: string) {
        setActiveTab(tabId);
        setIsDeleteModalOpen(true);
    }

    function handleDeleteTab(tabId: string) {
        if (tabIds.length === 1) {
            alert("You cannot delete the last remaining tab.");
            return;
        }
        setTabIds(tabIds.filter(id => id !== tabId));
        if (activeTab === tabId) {
            setActiveTab(tabIds.filter(id => id !== tabId)[0]);
        }
        deleteGoalStorage(tabId);
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

const DynamicTabLabel = ({ id }: { id: string }) => {
    const title = useGoalTitle(id);
    return <>{title}</>;
};