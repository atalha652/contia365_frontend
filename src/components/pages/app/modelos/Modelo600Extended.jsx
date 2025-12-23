// Extended sections for Modelo 600 form
import React, { useState } from "react";
import { Calculator, CreditCard, Users, FileCheck } from "lucide-react";
import { Button, Input, Select } from "../../../ui";

const Modelo600Extended = ({ formData, setFormData }) => {
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  return (
    <>
      {/* Número de Sujetos Pasivos/Transmitentes */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Número de Sujetos</h2>
            <p className="text-sm text-fg-60">Cantidad de sujetos pasivos y transmitentes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Número de Sujetos Pasivos/Transmitentes
            </label>
            <Input
              type="number"
              min="1"
              value={formData.numero_sujetos_pasivos_transmitentes || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                numero_sujetos_pasivos_transmitentes: e.target.value
              }))}
              placeholder="1"
            />
          </div>
        </div>
      </div>

      {/* Datos de Liquidación */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Datos de Liquidación</h2>
            <p className="text-sm text-fg-60">Información económica y cálculos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Valor Catastral (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.valor_catastral || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'valor_catastral', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Referencia Catastral
            </label>
            <Input
              type="text"
              value={formData.datos_liquidacion?.referencia_catastral || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'referencia_catastral', e.target.value)}
              placeholder="Referencia catastral"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Base Imponible (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.base_imponible || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'base_imponible', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Reducción (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.reduccion || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'reduccion', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Tipo (%)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.datos_liquidacion?.tipo || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'tipo', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Bonificación (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.bonificacion || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'bonificacion', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Cuota (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.cuota || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'cuota', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Cuota Complementaria (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.cuota_complementaria || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'cuota_complementaria', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Liquidación Complementaria (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_liquidacion?.liq_complementaria || ""}
              onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'liq_complementaria', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-bd-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-50 mb-2">
                Importe a Ingresar (€)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.datos_liquidacion?.importe_ingresar || ""}
                onChange={(e) => handleNestedInputChange('datos_liquidacion', null, 'importe_ingresar', e.target.value)}
                placeholder="0.00"
                className="font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Autoliquidación Complementaria */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Autoliquidación Complementaria</h2>
            <p className="text-sm text-fg-60">Información sobre liquidaciones anteriores</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              ¿Es complementaria?
            </label>
            <Select
              value={formData.autoliquidacion_complementaria?.si_no || ""}
              onChange={(e) => handleNestedInputChange('autoliquidacion_complementaria', null, 'si_no', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Fecha Presentación Liquidación Anterior
            </label>
            <Input
              type="date"
              value={formData.autoliquidacion_complementaria?.fecha_presentacion_liquidacion_anterior || ""}
              onChange={(e) => handleNestedInputChange('autoliquidacion_complementaria', null, 'fecha_presentacion_liquidacion_anterior', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Total a Ingresar */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Total a Ingresar</h2>
            <p className="text-sm text-fg-60">Importe final del impuesto</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Total a Ingresar (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.total_ingresar || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                total_ingresar: e.target.value
              }))}
              placeholder="0.00"
              className="font-bold text-lg"
            />
          </div>
        </div>
      </div>

      {/* Representante */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Representante</h2>
            <p className="text-sm text-fg-60">Datos del representante (si aplica)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              NIF/DNI
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.nif_dni || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'nif_dni', e.target.value)}
              placeholder="12345678A"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Apellidos y Nombre o Razón Social
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.apellidos_y_nombre_o_razon_social || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'apellidos_y_nombre_o_razon_social', e.target.value)}
              placeholder="Apellidos, Nombre o Razón Social"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Calle/Plaza/Avenida
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.calle_plaza_avenida || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'calle_plaza_avenida', e.target.value)}
              placeholder="Dirección"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Número
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.n || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'n', e.target.value)}
              placeholder="Nº"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Municipio
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.municipio || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'municipio', e.target.value)}
              placeholder="Municipio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Provincia
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.provincia || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'provincia', e.target.value)}
              placeholder="Provincia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Código Postal
            </label>
            <Input
              type="text"
              value={formData.etiqueta_identificativa_representante?.codigo_postal || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'codigo_postal', e.target.value)}
              placeholder="28001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.etiqueta_identificativa_representante?.telefono || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'telefono', e.target.value)}
              placeholder="600123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Fax
            </label>
            <Input
              type="tel"
              value={formData.etiqueta_identificativa_representante?.fax || ""}
              onChange={(e) => handleNestedInputChange('etiqueta_identificativa_representante', null, 'fax', e.target.value)}
              placeholder="911234567"
            />
          </div>
        </div>
      </div>

      {/* Forma de Pago */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Forma de Pago</h2>
            <p className="text-sm text-fg-60">Datos bancarios para el pago</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Entidad
            </label>
            <Input
              type="text"
              maxLength="4"
              value={formData.forma_pago?.entidad || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'entidad', e.target.value)}
              placeholder="0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Sucursal
            </label>
            <Input
              type="text"
              maxLength="4"
              value={formData.forma_pago?.sucursal || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'sucursal', e.target.value)}
              placeholder="0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Código Cuenta
            </label>
            <Input
              type="text"
              value={formData.forma_pago?.codigo_cuenta || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'codigo_cuenta', e.target.value)}
              placeholder="Código cuenta"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              DC
            </label>
            <Input
              type="text"
              maxLength="2"
              value={formData.forma_pago?.dc || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'dc', e.target.value)}
              placeholder="00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Número de Cuenta
            </label>
            <Input
              type="text"
              maxLength="10"
              value={formData.forma_pago?.num_cuenta || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'num_cuenta', e.target.value)}
              placeholder="0000000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Importe (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.forma_pago?.importe || ""}
              onChange={(e) => handleNestedInputChange('forma_pago', null, 'importe', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Firma Sujeto Pasivo Presentador */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Firma</h2>
            <p className="text-sm text-fg-60">Firma del sujeto pasivo presentador</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Firma Sujeto Pasivo Presentador
            </label>
            <Input
              type="text"
              value={formData.firma_sujeto_pasivo_presentador || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                firma_sujeto_pasivo_presentador: e.target.value
              }))}
              placeholder="Firma digital o referencia"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Modelo600Extended;
      {/* Anexo Sujetos Pasivos/Transmitentes */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Anexo Sujetos Pasivos/Transmitentes</h2>
            <p className="text-sm text-fg-60">Información adicional de sujetos (máximo 3)</p>
          </div>
        </div>
        
        {/* Note: For now showing placeholder for anexos - these would be dynamic forms */}
        <div className="bg-bg-60 border border-bd-40 rounded-lg p-4">
          <p className="text-sm text-fg-60 text-center">
            📋 Sección de anexos disponible para múltiples sujetos pasivos/transmitentes
          </p>
          <p className="text-xs text-fg-70 text-center mt-2">
            Incluye campos: coef_participacion, nif_dni, apellidos_y_nombre, dirección completa, teléfono, fax
          </p>
        </div>
      </div>

      {/* Anexo Transmitentes */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Anexo Transmitentes</h2>
            <p className="text-sm text-fg-60">Información adicional de transmitentes (máximo 3)</p>
          </div>
        </div>
        
        <div className="bg-bg-60 border border-bd-40 rounded-lg p-4">
          <p className="text-sm text-fg-60 text-center">
            📋 Sección de anexos disponible para múltiples transmitentes
          </p>
          <p className="text-xs text-fg-70 text-center mt-2">
            Incluye campos: coef_participacion, nif_dni, apellidos_y_nombre, dirección completa, teléfono, fax
          </p>
        </div>
      </div>

      {/* Firma Anexo */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/30 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Firma Anexo</h2>
            <p className="text-sm text-fg-60">Firma del sujeto pasivo presentador para anexos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Firma Sujeto Pasivo Presentador Anexo
            </label>
            <Input
              type="text"
              value={formData.firma_sujeto_pasivo_presentador_anexo || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                firma_sujeto_pasivo_presentador_anexo: e.target.value
              }))}
              placeholder="Firma digital o referencia para anexos"
            />
          </div>
        </div>
      </div>