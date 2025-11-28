// loading-manager.ts

// 基础接口定义
interface LoadTask {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: boolean;
  weight?: number;
  result?: any; // 新增：存储任务结果
}

interface LoaderConfig {
  weight?: number;
  onProgress?: (progress: number) => void;
  onComplete?: (result?: any) => void; // 修改：添加结果参数
  onError?: (error: Error) => void;
}

// 精确的事件类型定义
interface ProgressEvent {
  taskId: string;
  progress: number;
  type: string;
  name: string;
}

interface CompleteEvent {
  taskId: string;
  type: string;
  name: string;
  result?: any; // 新增：包含结果
}

interface ErrorEvent {
  taskId: string;
  type: string;
  name: string;
  error: Error;
}

interface AllCompleteEvent {
  message: string;
  results: Map<string, any>; // 新增：包含所有任务结果
}

// 使用联合类型和类型守卫来精确类型
type EventType = 'progress' | 'complete' | 'error' | 'allComplete';

// 精确的事件回调类型
interface EventCallbacks {
  progress: (data: ProgressEvent) => void;
  complete: (data: CompleteEvent) => void;
  error: (data: ErrorEvent) => void;
  allComplete: (data: AllCompleteEvent) => void;
}

class EventEmitter {
  private events: Partial<Record<EventType, Array<(data: any) => void>>> = {};

  on<K extends EventType>(event: K, callback: EventCallbacks[K]): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  emit<K extends EventType>(event: K, data: Parameters<EventCallbacks[K]>[0]): void {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  off<K extends EventType>(event: K, callback: EventCallbacks[K]): void {
    const callbacks = this.events[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

abstract class ResourceLoader extends EventEmitter {
  protected taskId: string;
  protected name: string;
  protected type: string;
  protected progress: number = 0;
  protected completed: boolean = false;
  protected weight: number;
  protected result?: any; // 新增：存储任务结果

  constructor(name: string, type: string, weight: number = 1) {
    super();
    this.taskId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.type = type;
    this.weight = weight;
  }

  abstract load(): Promise<void>;

  getTask(): LoadTask {
    return {
      id: this.taskId,
      name: this.name,
      type: this.type,
      progress: this.progress,
      completed: this.completed,
      weight: this.weight,
      result: this.result // 新增：包含结果
    };
  }

  getResult(): any {
    return this.result;
  }

  protected updateProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(100, progress));
    this.emit('progress', {
      taskId: this.taskId,
      progress: this.progress,
      type: this.type,
      name: this.name
    } as ProgressEvent);

    if (this.progress >= 100 && !this.completed) {
      this.completed = true;
      this.emit('complete', {
        taskId: this.taskId,
        type: this.type,
        name: this.name,
        result: this.result // 新增：包含结果
      } as CompleteEvent);
    }
  }

  protected handleError(error: Error): void {
    this.emit('error', {
      taskId: this.taskId,
      type: this.type,
      name: this.name,
      error
    } as ErrorEvent);
  }

  protected setResult(result: any): void {
    this.result = result;
  }
}

class ImageLoader extends ResourceLoader {
  private url: string;

  constructor(url: string, name?: string, weight: number = 1) {
    super(name || `Image: ${url.substring(url.lastIndexOf('/') + 1)}`, 'image', weight);
    this.url = url;
  }

  async load(): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.url, true);
      xhr.responseType = 'blob';
      
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          this.updateProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          img.src = url;
          
          img.onload = () => {
            this.setResult(img); // 存储图片元素作为结果
            this.updateProgress(100);
            URL.revokeObjectURL(url);
            resolve();
          };
          
          img.onerror = () => {
            const error = new Error(`Failed to load image: ${this.url}`);
            this.handleError(error);
            reject(error);
          };
        } else {
          const error = new Error(`Failed to fetch image: ${this.url}`);
          this.handleError(error);
          reject(error);
        }
      };
      
      xhr.onerror = () => {
        const error = new Error(`Network error while loading image: ${this.url}`);
        this.handleError(error);
        reject(error);
      };
      
      xhr.send();
    });
  }
}

class FontLoader extends ResourceLoader {
  private fontFamily: string;
  private fontUrl: string;

  constructor(fontFamily: string, fontUrl: string, weight: number = 1) {
    super(`Font: ${fontFamily}`, 'font', weight);
    this.fontFamily = fontFamily;
    this.fontUrl = fontUrl;
  }

  async load(): Promise<void> {
    return new Promise((resolve, reject) => {
      const fontFace = new FontFace(this.fontFamily, `url(${this.fontUrl})`);
      
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        this.setResult(loadedFace); // 存储字体对象作为结果
        
        const checkFont = () => {
          if (document.fonts.check(`12px ${this.fontFamily}`)) {
            this.updateProgress(100);
            resolve();
          } else {
            setTimeout(checkFont, 100);
          }
        };
        
        checkFont();
      }).catch((error) => {
        this.handleError(error);
        reject(error);
      });
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          clearInterval(interval);
        }
        this.updateProgress(progress);
      }, 200);
    });
  }
}

// 修改 WorkerLoader 以支持结果返回
class WorkerLoader<T = any> extends ResourceLoader {
  private workerScript: string;
  private data: any;
  private worker: Worker | null = null;

  constructor(workerScript: string, data: any, name: string = 'Worker Task', weight: number = 1) {
    super(name, 'worker', weight);
    this.workerScript = workerScript;
    this.data = data;
  }

  async load(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.worker = new Worker(this.workerScript);
      
      this.worker.postMessage(this.data);
      
      this.worker.onmessage = (e) => {
        if (e.data.type === 'progress') {
          this.updateProgress(e.data.progress);
        } else if (e.data.type === 'complete') {
          this.setResult(e.data.result); // 存储 Worker 计算结果
          this.updateProgress(100);
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
          resolve();
        } else if (e.data.type === 'result') {
          // 如果 Worker 提前发送结果
          this.setResult(e.data.result);
        }
      };
      
      this.worker.onerror = (error) => {
        this.handleError(error.error);
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        reject(error);
      };
    });
  }

  // 新增：主动向 Worker 发送消息
  postMessage(message: any): void {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  }

  // 新增：终止 Worker
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

class PromiseLoader<T = any> extends ResourceLoader {
  private promiseFn: (updateProgress: (progress: number) => void) => Promise<T>;

  constructor(
    name: string, 
    promiseFn: (updateProgress: (progress: number) => void) => Promise<T>, 
    weight: number = 1
  ) {
    super(name, 'promise', weight);
    this.promiseFn = promiseFn;
  }

  async load(): Promise<void> {
    try {
      const result = await this.promiseFn((progress: number) => this.updateProgress(progress));
      this.setResult(result); // 存储 Promise 结果
      this.updateProgress(100);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
}

class LoadingManager extends EventEmitter {
  private tasks: Map<string, ResourceLoader> = new Map();
  private totalProgress: number = 0;
  private completed: boolean = false;
  private totalWeight: number = 0;
  private completedWeight: number = 0;
  private taskResults: Map<string, any> = new Map(); // 新增：存储所有任务结果

  addLoader(loader: ResourceLoader): string {
    this.tasks.set(loader.getTask().id, loader);
    this.totalWeight += loader.getTask().weight || 1;
    
    // 监听加载器事件
    loader.on('progress', (data: ProgressEvent) => {
      this.calculateTotalProgress();
      this.emit('progress', data);
    });
    
    loader.on('complete', (data: CompleteEvent) => {
      this.completedWeight += loader.getTask().weight || 1;
      // 存储任务结果
      if (data.result !== undefined) {
        this.taskResults.set(data.taskId, data.result);
      }
      this.calculateTotalProgress();
      this.emit('complete', data);
      
      this.checkAllComplete();
    });
    
    loader.on('error', (data: ErrorEvent) => {
      this.emit('error', data);
    });
    
    return loader.getTask().id;
  }

  addImage(url: string, name?: string, weight?: number): string {
    const loader = new ImageLoader(url, name, weight);
    return this.addLoader(loader);
  }

  addFont(fontFamily: string, fontUrl: string, weight?: number): string {
    const loader = new FontLoader(fontFamily, fontUrl, weight);
    return this.addLoader(loader);
  }

  addWorker<T = any>(workerScript: string, data: any, name?: string, weight?: number): WorkerLoader<T> {
    const loader = new WorkerLoader<T>(workerScript, data, name, weight);
    this.addLoader(loader);
    return loader; // 返回 loader 实例以便后续操作
  }

  addPromise<T = any>(
    name: string, 
    promiseFn: (updateProgress: (progress: number) => void) => Promise<T>, 
    weight?: number
  ): string {
    const loader = new PromiseLoader(name, promiseFn, weight);
    return this.addLoader(loader);
  }

  async start(): Promise<Map<string, any>> {
    const promises: Promise<void>[] = [];
    
    this.tasks.forEach(loader => {
      promises.push(loader.load());
    });
    
    try {
      await Promise.all(promises);
      this.completed = true;
      this.emit('allComplete', { 
        message: 'All tasks completed successfully',
        results: this.taskResults
      } as AllCompleteEvent);
      return this.taskResults; // 返回所有任务结果
    } catch (error) {
      this.emit('error', {
        taskId: 'manager',
        type: 'manager',
        name: 'Loading Manager',
        error: error as Error
      } as ErrorEvent);
      throw error;
    }
  }

  getTaskProgress(taskId: string): number {
    const loader = this.tasks.get(taskId);
    return loader ? loader.getTask().progress : 0;
  }

  getTaskResult<T = any>(taskId: string): T | undefined {
    return this.taskResults.get(taskId) as T;
  }

  getAllResults(): Map<string, any> {
    return new Map(this.taskResults);
  }

  getTotalProgress(): number {
    return this.totalProgress;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  getTasks(): LoadTask[] {
    return Array.from(this.tasks.values()).map(loader => loader.getTask());
  }

  getLoader<T extends ResourceLoader = ResourceLoader>(taskId: string): T | undefined {
    return this.tasks.get(taskId) as T;
  }

  private calculateTotalProgress(): void {
    if (this.totalWeight === 0) {
      this.totalProgress = 0;
      return;
    }
    
    let weightedProgress = 0;
    this.tasks.forEach(loader => {
      const task = loader.getTask();
      weightedProgress += task.progress * (task.weight || 1);
    });
    
    this.totalProgress = Math.min(100, weightedProgress / this.totalWeight);
  }

  private checkAllComplete(): void {
    let allComplete = true;
    this.tasks.forEach(loader => {
      if (!loader.getTask().completed) {
        allComplete = false;
      }
    });
    
    if (allComplete && this.tasks.size > 0) {
      this.completed = true;
      this.emit('allComplete', { 
        message: 'All tasks completed successfully',
        results: this.taskResults
      } as AllCompleteEvent);
    }
  }
}

// 创建Worker脚本的工具函数
function createWorkerScript(script: string): string {
  const blob = new Blob([script], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

// 示例Worker脚本 - 修改为返回计算结果
const exampleWorkerScript = `
self.onmessage = function(e) {
  const total = e.data.total || 100;
  let result = 0;
  
  // 模拟计算过程
  for (let i = 0; i <= total; i++) {
    if (i % 10 === 0) {
      // 每10%报告一次进度
      const progress = (i / total) * 100;
      self.postMessage({ type: 'progress', progress: progress });
      
      // 模拟计算时间
      const start = Date.now();
      while (Date.now() - start < 50) {
        // 空循环模拟计算
      }
    }
    
    // 模拟计算（例如累加）
    result += i * 0.1;
  }
  
  // 发送最终结果
  self.postMessage({ type: 'complete', result: result });
};
`;


const gifSolver = `

`
// 更复杂的Worker示例，支持交互
const interactiveWorkerScript = `
self.onmessage = function(e) {
  if (e.data.type === 'start') {
    // 开始计算
    const total = e.data.total || 100;
    let result = 0;
    
    for (let i = 0; i <= total; i++) {
      if (i % 10 === 0) {
        const progress = (i / total) * 100;
        self.postMessage({ type: 'progress', progress: progress });
        
        // 模拟计算时间
        const start = Date.now();
        while (Date.now() - start < 50) {}
      }
      
      result += i * 0.1;
    }
    
    self.postMessage({ type: 'complete', result: result });
  } else if (e.data.type === 'process') {
    // 处理特定数据
    const input = e.data.input;
    const processed = input * 2 + 10; // 示例处理
    self.postMessage({ type: 'result', result: processed });
  }
};
`;

export {
  LoadingManager, 
  ImageLoader, 
  FontLoader, 
  WorkerLoader, 
  PromiseLoader,
  createWorkerScript,
  exampleWorkerScript,
  interactiveWorkerScript
};

// 导出事件类型，方便外部使用
export type { 
  ProgressEvent, 
  CompleteEvent, 
  ErrorEvent, 
  AllCompleteEvent,
  LoadTask 
};