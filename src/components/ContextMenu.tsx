import React from 'react';
import {Field} from './PDFViewer';

type Props = {
    contextMenu: { x: number, y: number, fieldId: string };
    field: Field;
    updateFieldProperty: (fieldId: string, prop: keyof Field, value: unknown) => void;
};

export const ContextMenu: React.FC<Props> = ({contextMenu, field, updateFieldProperty}) => (
    <div
        id="pdf-context-menu"
        style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'black',
            border: '1px solid #ccc',
            zIndex: 1000,
            padding: 8,
            borderRadius: 4,
            minWidth: 180
        }}>
        <div>
            <label className="block text-xs">Font Family:</label>
            <select
                value={field.fontFamily || 'Helvetica'}
                onChange={e => updateFieldProperty(field.id, 'fontFamily', e.target.value)}>
                <option value="Helvetica">Helvetica</option>
                <option value="TimesRoman">TimesRoman</option>
                <option value="Courier">Courier</option>
            </select>
        </div>
        <div>
            <label className="block text-xs">Font Size:</label>
            <input
                type="number"
                min={6}
                max={72}
                value={field.fontSize || 14}
                onChange={e => updateFieldProperty(field.id, 'fontSize', parseInt(e.target.value, 10))}
                style={{width: 60}}
            />
        </div>
        <div>
            <label className="block text-xs">Alignment:</label>
            <select
                value={field.align || 'left'}
                onChange={e => updateFieldProperty(field.id, 'align', e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </select>
        </div>
        <div>
            <label className="block text-xs">Ancho:</label>
            <input type='number'
                   value={field.width}
                   onChange={e => updateFieldProperty(field.id, 'width', Number(e.target.value))}
                   className="w-full border rounded px-1 py-0.5"/>
        </div>
        <div>
            <label className="block text-xs">Alto:</label>
            <input type='number'
                   value={field.height}
                   onChange={e => updateFieldProperty(field.id, 'height', Number(e.target.value))}
                   className="w-full border rounded px-1 py-0.5"/>
        </div>
        <div>
            <label className="block text-xs">Pos X:</label>
            <input type='number'
                   value={field.x}
                   onChange={e => updateFieldProperty(field.id, 'x', Number(e.target.value))}
                   className="w-full border rounded px-1 py-0.5"/>
        </div>
        <div>
            <label className="block text-xs">Pos Y:</label>
            <input type='number'
                   value={field.y}
                   onChange={e => updateFieldProperty(field.id, 'y', Number(e.target.value))}
                   className="w-full border rounded px-1 py-0.5"/>
        </div>
    </div>
);
