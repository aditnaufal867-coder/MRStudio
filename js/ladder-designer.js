// MRStudio Ladder Designer JavaScript

class LadderDesigner {
    constructor() {
        this.canvas = document.getElementById('ladder-canvas');
        this.svg = document.getElementById('ladder-svg');
        this.selectedTool = 'select';
        this.selectedElement = null;
        this.elements = [];
        this.connections = [];
        this.gridSize = 40;
        this.zoom = 1;
        this.gridVisible = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupTools();
        this.createGrid();
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
    }
    
    setupEventListeners() {
        // Tool selection
        document.getElementById('select-tool').addEventListener('click', () => {
            this.selectedTool = 'select';
            this.updateToolButtons();
        });
        
        document.getElementById('line-tool').addEventListener('click', () => {
            this.selectedTool = 'line';
            this.updateToolButtons();
        });
        
        document.getElementById('delete-tool').addEventListener('click', () => {
            this.selectedTool = 'delete';
            this.updateToolButtons();
        });
        
        // Canvas events
        this.svg.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.svg.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('grid-toggle').addEventListener('click', () => this.toggleGrid());
    }
    
    setupTools() {
        this.updateToolButtons();
    }
    
    updateToolButtons() {
        const buttons = document.querySelectorAll('.ladder-toolbar .btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch(this.selectedTool) {
            case 'select':
                document.getElementById('select-tool').classList.add('active');
                break;
            case 'line':
                document.getElementById('line-tool').classList.add('active');
                break;
            case 'delete':
                document.getElementById('delete-tool').classList.add('active');
                break;
        }
    }
    
    createGrid() {
        // Create grid lines
        const width = 2000; // Large canvas
        const height = 1200;
        
        // Clear existing grid
        const existingGrid = this.svg.querySelector('.grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        grid.setAttribute('class', 'grid');
        
        // Vertical lines
        for (let x = 0; x <= width; x += this.gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', '#e0e0e0');
            line.setAttribute('stroke-width', '1');
            grid.appendChild(line);
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += this.gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e0e0e0');
            line.setAttribute('stroke-width', '1');
            grid.appendChild(line);
        }
        
        this.svg.appendChild(grid);
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
    }
    
    setupDragAndDrop() {
        const elements = document.querySelectorAll('.element-item');
        elements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('element-type', e.target.dataset.element);
            });
        });
        
        this.svg.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        this.svg.addEventListener('drop', (e) => {
            e.preventDefault();
            const elementType = e.dataTransfer.getData('element-type');
            const rect = this.svg.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.zoom;
            const y = (e.clientY - rect.top) / this.zoom;
            
            this.addElement(elementType, x, y);
        });
    }
    
    addElement(type, x, y) {
        // Snap to grid
        const gridX = Math.round(x / this.gridSize) * this.gridSize;
        const gridY = Math.round(y / this.gridSize) * this.gridSize;
        
        const element = {
            id: this.generateId(),
            type: type,
            x: gridX,
            y: gridY,
            address: '',
            properties: {}
        };
        
        this.elements.push(element);
        this.renderElement(element);
        this.selectElement(element);
    }
    
    renderElement(element) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'canvas-element');
        group.setAttribute('data-id', element.id);
        group.setAttribute('transform', `translate(${element.x}, ${element.y})`);
        
        let shape;
        
        switch(element.type) {
            case 'NO':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', '10');
                shape.setAttribute('y', '10');
                shape.setAttribute('width', '20');
                shape.setAttribute('height', '20');
                shape.setAttribute('fill', 'none');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                break;
                
            case 'NC':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', '10');
                shape.setAttribute('y', '10');
                shape.setAttribute('width', '20');
                shape.setAttribute('height', '20');
                shape.setAttribute('fill', '#333');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                break;
                
            case 'COIL':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                shape.setAttribute('cx', '20');
                shape.setAttribute('cy', '20');
                shape.setAttribute('r', '10');
                shape.setAttribute('fill', 'none');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                break;
                
            case 'TIMER':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', '5');
                shape.setAttribute('y', '5');
                shape.setAttribute('width', '30');
                shape.setAttribute('height', '30');
                shape.setAttribute('fill', 'none');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                shape.setAttribute('rx', '3');
                break;
                
            case 'COUNTER':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', '5');
                shape.setAttribute('y', '5');
                shape.setAttribute('width', '30');
                shape.setAttribute('height', '30');
                shape.setAttribute('fill', 'none');
                shape.setAttribute('stroke', '#333');
                shape.setAttribute('stroke-width', '2');
                shape.setAttribute('rx', '3');
                break;
        }
        
        group.appendChild(shape);
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '0');
        label.setAttribute('y', '45');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#333');
        label.textContent = element.address || element.type;
        group.appendChild(label);
        
        // Event listeners
        group.addEventListener('click', () => this.selectElement(element));
        group.addEventListener('mousedown', (e) => this.handleElementMouseDown(e, element));
        
        this.svg.appendChild(group);
    }
    
    selectElement(element) {
        // Deselect all elements
        const allElements = this.svg.querySelectorAll('.canvas-element');
        allElements.forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select the clicked element
        const elementGroup = this.svg.querySelector(`[data-id="${element.id}"]`);
        if (elementGroup) {
            elementGroup.classList.add('selected');
            this.selectedElement = element;
            this.updatePropertiesPanel(element);
        }
    }
    
    updatePropertiesPanel(element) {
        document.getElementById('element-address').value = element.address;
        document.getElementById('element-type').value = element.properties.type || 'input';
        
        // Show/hide timer/counter parameters
        const timerParams = document.getElementById('timer-params');
        const counterParams = document.getElementById('counter-params');
        
        if (element.type === 'TIMER') {
            timerParams.style.display = 'block';
            counterParams.style.display = 'none';
            document.getElementById('timer-preset').value = element.properties.preset || 1000;
        } else if (element.type === 'COUNTER') {
            timerParams.style.display = 'none';
            counterParams.style.display = 'block';
            document.getElementById('counter-preset').value = element.properties.preset || 10;
        } else {
            timerParams.style.display = 'none';
            counterParams.style.display = 'none';
        }
    }
    
    handleCanvasClick(e) {
        if (this.selectedTool === 'select') {
            // Deselect if clicking on empty space
            this.selectedElement = null;
            const allElements = this.svg.querySelectorAll('.canvas-element');
            allElements.forEach(el => {
                el.classList.remove('selected');
            });
        }
    }
    
    handleMouseDown(e) {
        if (this.selectedTool === 'line' && !e.target.classList.contains('canvas-element')) {
            this.drawingLine = true;
            this.lineStart = this.getMousePosition(e);
        }
    }
    
    handleMouseMove(e) {
        if (this.drawingLine) {
            const currentPos = this.getMousePosition(e);
            this.updateTemporaryLine(this.lineStart, currentPos);
        }
    }
    
    handleMouseUp(e) {
        if (this.drawingLine) {
            this.drawingLine = false;
            const endPos = this.getMousePosition(e);
            
            // Snap to grid
            const startX = Math.round(this.lineStart.x / this.gridSize) * this.gridSize;
            const startY = Math.round(this.lineStart.y / this.gridSize) * this.gridSize;
            const endX = Math.round(endPos.x / this.gridSize) * this.gridSize;
            const endY = Math.round(endPos.y / this.gridSize) * this.gridSize;
            
            if (Math.abs(endX - startX) > 10 || Math.abs(endY - startY) > 10) {
                this.addConnection(startX, startY, endX, endY);
            }
            
            this.removeTemporaryLine();
        }
    }
    
    getMousePosition(e) {
        const rect = this.svg.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.zoom,
            y: (e.clientY - rect.top) / this.zoom
        };
    }
    
    addConnection(x1, y1, x2, y2) {
        const connection = {
            id: this.generateId(),
            x1, y1, x2, y2,
            type: Math.abs(x2 - x1) > Math.abs(y2 - y1) ? 'horizontal' : 'vertical'
        };
        
        this.connections.push(connection);
        this.renderConnection(connection);
    }
    
    renderConnection(connection) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-id', connection.id);
        line.setAttribute('x1', connection.x1);
        line.setAttribute('y1', connection.y1);
        line.setAttribute('x2', connection.x2);
        line.setAttribute('y2', connection.y2);
        line.setAttribute('stroke', '#333');
        line.setAttribute('stroke-width', '2');
        
        this.svg.appendChild(line);
    }
    
    updateTemporaryLine(start, end) {
        this.removeTemporaryLine();
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line temporary-line');
        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x);
        line.setAttribute('y2', end.y);
        line.setAttribute('stroke', '#3c8dbc');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        
        this.svg.appendChild(line);
        this.temporaryLine = line;
    }
    
    removeTemporaryLine() {
        if (this.temporaryLine) {
            this.temporaryLine.remove();
            this.temporaryLine = null;
        }
    }
    
    handleElementMouseDown(e, element) {
        if (this.selectedTool === 'select') {
            this.selectElement(element);
            this.draggingElement = element;
            this.dragOffset = {
                x: e.clientX - element.x,
                y: e.clientY - element.y
            };
            e.stopPropagation();
        }
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3);
        this.svg.style.transform = `scale(${this.zoom})`;
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.5);
        this.svg.style.transform = `scale(${this.zoom})`;
    }
    
    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        const canvas = document.getElementById('ladder-canvas');
        if (this.gridVisible) {
            canvas.classList.remove('grid-hidden');
        } else {
            canvas.classList.add('grid-hidden');
        }
    }
    
    generateId() {
        return 'elem_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Delete':
                    if (this.selectedElement) {
                        this.deleteSelectedElement();
                    }
                    break;
                case 's':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.saveProject();
                    }
                    break;
                case 'o':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.openProject();
                    }
                    break;
            }
        });
    }
    
    deleteSelectedElement() {
        if (this.selectedElement) {
            // Remove from elements array
            this.elements = this.elements.filter(el => el.id !== this.selectedElement.id);
            
            // Remove from DOM
            const elementGroup = this.svg.querySelector(`[data-id="${this.selectedElement.id}"]`);
            if (elementGroup) {
                elementGroup.remove();
            }
            
            this.selectedElement = null;
        }
    }
    
    saveProject() {
        const project = {
            elements: this.elements,
            connections: this.connections,
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(project, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ladder-project.json';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const project = JSON.parse(e.target.result);
                this.loadProject(project);
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    loadProject(project) {
        // Clear current project
        this.elements = [];
        this.connections = [];
        this.svg.querySelectorAll('.canvas-element, .connection-line').forEach(el => el.remove());
        
        // Load elements
        project.elements.forEach(element => {
            this.elements.push(element);
            this.renderElement(element);
        });
        
        // Load connections
        project.connections.forEach(connection => {
            this.connections.push(connection);
            this.renderConnection(connection);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ladderDesigner = new LadderDesigner();
});