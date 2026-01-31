import { AppSettings, Project } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = 'estimator_projects';
const SETTINGS_KEY = 'estimator_settings';

const DEFAULT_SETTINGS: AppSettings = {
    defaultWaste: '10',
    defaultUnit: 'ft',
};

export const StorageService = {
    async getProjects(): Promise<Project[]> {
        try {
            const json = await AsyncStorage.getItem(PROJECTS_KEY);
            return json != null ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to load projects', e);
            return [];
        }
    },

    async saveProject(project: Project): Promise<void> {
        try {
            const projects = await this.getProjects();
            const existingIndex = projects.findIndex(p => p.id === project.id);

            let newProjects;
            if (existingIndex >= 0) {
                newProjects = [...projects];
                newProjects[existingIndex] = project;
            } else {
                newProjects = [project, ...projects];
            }

            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        } catch (e) {
            console.error('Failed to save project', e);
            throw e;
        }
    },

    async deleteProject(id: string): Promise<void> {
        try {
            const projects = await this.getProjects();
            const newProjects = projects.filter(p => p.id !== id);
            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        } catch (e) {
            console.error('Failed to delete project', e);
            throw e;
        }
    },

    async getProject(id: string): Promise<Project | null> {
        const projects = await this.getProjects();
        return projects.find(p => p.id === id) || null;
    },

    async getSettings(): Promise<AppSettings> {
        try {
            const json = await AsyncStorage.getItem(SETTINGS_KEY);
            return json != null ? JSON.parse(json) : DEFAULT_SETTINGS;
        } catch (e) {
            console.error('Failed to load settings', e);
            return DEFAULT_SETTINGS;
        }
    },

    async saveSettings(settings: AppSettings): Promise<void> {
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings', e);
            throw e;
        }
    },

    async duplicateProject(originalId: string): Promise<void> {
        try {
            const projects = await this.getProjects();
            const originalProject = projects.find(p => p.id === originalId);

            if (!originalProject) {
                throw new Error('Project not found');
            }

            const newProject: Project = {
                ...originalProject,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: `Copy of ${originalProject.name}`,
                createdAt: Date.now(),
            };

            await this.saveProject(newProject);
        } catch (e) {
            console.error('Failed to duplicate project', e);
            throw e;
        }
    }
};
