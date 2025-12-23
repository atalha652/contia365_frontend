// Extended sections for the new Modelo 600 structure
import React from "react";
import { Calculator, CreditCard, Users, FileCheck, MapPin, Home } from "lucide-react";
import { Button, Input, Select } from "../../../ui";

const Modelo600NewExtended = ({ formData, setFormData }) => {
  // Helper functions for nested updates
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

  const handleTripleNestedInputChange = (section, subsection, subsubsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [subsubsection]: {
            ...prev[section][subsection][subsubsection],
            [field]: value
          }
        }
      }
    }));
  };

  const handleCheckboxChange = (section, subsection, field, checked) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: checked
        }
      }
    }));
  };

  return (
    <>
      {/* Datos del Bien */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Datos del Bien</h2>
            <p className="text-sm text-fg-60">Información sobre el bien objeto de transmisión</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Concepto
            </label>
            <Input
              type="text"
              value={formData.datos_bien?.concepto || ""}
              onChange={(e) => handleInputChange('datos_bien', 'concepto', e.target.value)}
              placeholder="Descripción del bien"
            />
          </div>
          
          {/* Tipo de Bien - Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Tipo de Bien
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.datos_bien?.tipo_bien?.urbano || false}
                  onChange={(e) => handleCheckboxChange('datos_bien', 'tipo_bien', 'urbano', e.target.checked)}
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                />
                <span className="text-sm text-fg-50">Urbano</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.datos_bien?.tipo_bien?.rustico || false}
                  onChange={(e) => handleCheckboxChange('datos_bien', 'tipo_bien', 'rustico', e.target.checked)}
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                />
                <span className="text-sm text-fg-50">Rústico</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Referencia Catastral
            </label>
            <Input
              type="text"
              value={formData.datos_bien?.referencia_catastral || ""}
              onChange={(e) => handleInputChange('datos_bien', 'referencia_catastral', e.target.value)}
              placeholder="Referencia catastral"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Otros Datos Identificativos
            </label>
            <Input
              type="text"
              value={formData.datos_bien?.otros_datos_identificativos || ""}
              onChange={(e) => handleInputChange('datos_bien', 'otros_datos_identificativos', e.target.value)}
              placeholder="Otros datos identificativos"
            />
          </div>
        </div>

        {/* Ubicación del Bien */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-fg-50 mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Ubicación del Bien
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-fg-60 mb-1">Vía Pública/Paraje</label>
              <Input
                type="text"
                value={formData.datos_bien?.via_publica_paraje || ""}
                onChange={(e) => handleInputChange('datos_bien', 'via_publica_paraje', e.target.value)}
                placeholder="Vía pública o paraje"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-60 mb-1">Número</label>
              <Input
                type="text"
                value={formData.datos_bien?.numero || ""}
                onChange={(e) => handleInputChange('datos_bien', 'numero', e.target.value)}
                placeholder="Nº"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-60 mb-1">Escalera</label>
              <Input
                type="text"
                value={formData.datos_bien?.escalera || ""}
                onChange={(e) => handleInputChange('datos_bien', 'escalera', e.target.value)}
                placeholder="Esc"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-60 mb-1">Piso</label>
              <Input
                type="text"
                value={formData.datos_bien?.piso || ""}
                onChange={(e) => handleInputChange('datos_bien', 'piso', e.target.value)}
                placeholder="Piso"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-60 mb-1">Puerta</label>
              <Input
                type="text"
                value={formData.datos_bien?.puerta || ""}
                onChange={(e) => handleInputChange('datos_bien', 'puerta', e.target.value)}
                placeholder="Pta"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-50 mb-2">
                Municipio
              </label>
              <Input
                type="text"
                value={formData.datos_bien?.municipio || ""}
                onChange={(e) => handleInputChange('datos_bien', 'municipio', e.target.value)}
                placeholder="Municipio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-50 mb-2">
                Provincia
              </label>
              <Input
                type="text"
                value={formData.datos_bien?.provincia || ""}
                onChange={(e) => handleInputChange('datos_bien', 'provincia', e.target.value)}
                placeholder="Provincia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-50 mb-2">
                Código Postal
              </label>
              <Input
                type="text"
                value={formData.datos_bien?.codigo_postal || ""}
                onChange={(e) => handleInputChange('datos_bien', 'codigo_postal', e.target.value)}
                placeholder="28001"
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Superficie (m²)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_bien?.superficie || ""}
              onChange={(e) => handleInputChange('datos_bien', 'superficie', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Valor Catastral (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_bien?.valor_catastral || ""}
              onChange={(e) => handleInputChange('datos_bien', 'valor_catastral', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Valor Declarado (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.datos_bien?.valor_declarado || ""}
              onChange={(e) => handleInputChange('datos_bien', 'valor_declarado', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      {/* Autoliquidación */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Autoliquidación</h2>
            <p className="text-sm text-fg-60">Cálculos y liquidación del impuesto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Valor (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.valor || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'valor', e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoliquidacion?.exento || false}
                onChange={(e) => handleInputChange('autoliquidacion', 'exento', e.target.checked)}
                className="form-checkbox h-4 w-4 rounded border-bd-50"
              />
              <span className="text-sm text-fg-50">Exento</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoliquidacion?.no_sujeto || false}
                onChange={(e) => handleInputChange('autoliquidacion', 'no_sujeto', e.target.checked)}
                className="form-checkbox h-4 w-4 rounded border-bd-50"
              />
              <span className="text-sm text-fg-50">No Sujeto</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Fundamento Beneficio Fiscal o No Sujeción
            </label>
            <Input
              type="text"
              value={formData.autoliquidacion?.fundamento_beneficio_fiscal_o_no_sujecion || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'fundamento_beneficio_fiscal_o_no_sujecion', e.target.value)}
              placeholder="Fundamento legal"
            />
          </div>
        </div>

        {/* Liquidación Complementaria */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoliquidacion?.liquidacion_complementaria || false}
                onChange={(e) => handleInputChange('autoliquidacion', 'liquidacion_complementaria', e.target.checked)}
                className="form-checkbox h-4 w-4 rounded border-bd-50"
              />
              <span className="text-sm font-semibold text-fg-50">Liquidación Complementaria</span>
            </label>
          </div>
          
          {formData.autoliquidacion?.liquidacion_complementaria && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-bg-60 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número Primera Liquidación
                </label>
                <Input
                  type="text"
                  value={formData.autoliquidacion?.datos_primera_liquidacion?.numero || ""}
                  onChange={(e) => handleNestedInputChange('autoliquidacion', 'datos_primera_liquidacion', 'numero', e.target.value)}
                  placeholder="Número"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Fecha Presentación
                </label>
                <Input
                  type="date"
                  value={formData.autoliquidacion?.datos_primera_liquidacion?.fecha_presentacion || ""}
                  onChange={(e) => handleNestedInputChange('autoliquidacion', 'datos_primera_liquidacion', 'fecha_presentacion', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Importe Ingresado (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.autoliquidacion?.datos_primera_liquidacion?.importe_ingresado || ""}
                  onChange={(e) => handleNestedInputChange('autoliquidacion', 'datos_primera_liquidacion', 'importe_ingresado', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cálculos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Base Imponible (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.base_imponible || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'base_imponible', e.target.value)}
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
              value={formData.autoliquidacion?.reduccion || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'reduccion', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Base Liquidable (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.base_liquidable || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'base_liquidable', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Tipo Impositivo (%)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.autoliquidacion?.tipo_impositivo || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'tipo_impositivo', e.target.value)}
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
              value={formData.autoliquidacion?.cuota || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'cuota', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Bonificación Cuota (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.bonificacion_cuota || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'bonificacion_cuota', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Importe a Ingresar (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.importe_a_ingresar || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'importe_a_ingresar', e.target.value)}
              placeholder="0.00"
              className="font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Total a Ingresar (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.autoliquidacion?.total_a_ingresar || ""}
              onChange={(e) => handleInputChange('autoliquidacion', 'total_a_ingresar', e.target.value)}
              placeholder="0.00"
              className="font-bold text-lg"
            />
          </div>
        </div>
      </div>
      {/* Presentador */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Presentador</h2>
            <p className="text-sm text-fg-60">Datos del presentador del formulario</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              NIF/DNI
            </label>
            <Input
              type="text"
              value={formData.presentador?.nif_dni || ""}
              onChange={(e) => handleInputChange('presentador', 'nif_dni', e.target.value)}
              placeholder="12345678A"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Nombre y Apellidos
            </label>
            <Input
              type="text"
              value={formData.presentador?.nombre_apellidos || ""}
              onChange={(e) => handleInputChange('presentador', 'nombre_apellidos', e.target.value)}
              placeholder="Nombre y apellidos completos"
            />
          </div>
          
          {/* Dirección del Presentador */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-fg-50 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dirección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-fg-60 mb-1">Vía</label>
                <Input
                  type="text"
                  value={formData.presentador?.direccion?.via || ""}
                  onChange={(e) => handleNestedInputChange('presentador', 'direccion', 'via', e.target.value)}
                  placeholder="Calle, Plaza, Avenida..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1">Número</label>
                <Input
                  type="text"
                  value={formData.presentador?.direccion?.numero || ""}
                  onChange={(e) => handleNestedInputChange('presentador', 'direccion', 'numero', e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1">Escalera</label>
                <Input
                  type="text"
                  value={formData.presentador?.direccion?.escalera || ""}
                  onChange={(e) => handleNestedInputChange('presentador', 'direccion', 'escalera', e.target.value)}
                  placeholder="Esc"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1">Piso</label>
                <Input
                  type="text"
                  value={formData.presentador?.direccion?.piso || ""}
                  onChange={(e) => handleNestedInputChange('presentador', 'direccion', 'piso', e.target.value)}
                  placeholder="Piso"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1">Puerta</label>
                <Input
                  type="text"
                  value={formData.presentador?.direccion?.puerta || ""}
                  onChange={(e) => handleNestedInputChange('presentador', 'direccion', 'puerta', e.target.value)}
                  placeholder="Pta"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Municipio
            </label>
            <Input
              type="text"
              value={formData.presentador?.municipio || ""}
              onChange={(e) => handleInputChange('presentador', 'municipio', e.target.value)}
              placeholder="Municipio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Provincia
            </label>
            <Input
              type="text"
              value={formData.presentador?.provincia || ""}
              onChange={(e) => handleInputChange('presentador', 'provincia', e.target.value)}
              placeholder="Provincia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Código Postal
            </label>
            <Input
              type="text"
              value={formData.presentador?.codigo_postal || ""}
              onChange={(e) => handleInputChange('presentador', 'codigo_postal', e.target.value)}
              placeholder="28001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.presentador?.telefono || ""}
              onChange={(e) => handleInputChange('presentador', 'telefono', e.target.value)}
              placeholder="600123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Fax
            </label>
            <Input
              type="tel"
              value={formData.presentador?.fax || ""}
              onChange={(e) => handleInputChange('presentador', 'fax', e.target.value)}
              placeholder="911234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Etiqueta Identificativa
            </label>
            <Input
              type="text"
              value={formData.presentador?.etiqueta_identificativa || ""}
              onChange={(e) => handleInputChange('presentador', 'etiqueta_identificativa', e.target.value)}
              placeholder="Etiqueta"
            />
          </div>
        </div>
      </div>

      {/* Firma */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Firma</h2>
            <p className="text-sm text-fg-60">Lugar, fecha y firma</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Lugar
            </label>
            <Input
              type="text"
              value={formData.firma?.lugar || ""}
              onChange={(e) => handleInputChange('firma', 'lugar', e.target.value)}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Día
            </label>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.firma?.dia || ""}
              onChange={(e) => handleInputChange('firma', 'dia', e.target.value)}
              placeholder="DD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Mes
            </label>
            <Input
              type="number"
              min="1"
              max="12"
              value={formData.firma?.mes || ""}
              onChange={(e) => handleInputChange('firma', 'mes', e.target.value)}
              placeholder="MM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Año
            </label>
            <Input
              type="number"
              min="2000"
              max="2030"
              value={formData.firma?.anio || ""}
              onChange={(e) => handleInputChange('firma', 'anio', e.target.value)}
              placeholder="YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Firma Sujeto Pasivo/Presentador
            </label>
            <Input
              type="text"
              value={formData.firma?.firma_sujeto_pasivo_o_presentador || ""}
              onChange={(e) => handleInputChange('firma', 'firma_sujeto_pasivo_o_presentador', e.target.value)}
              placeholder="Firma digital"
            />
          </div>
        </div>
      </div>

      {/* Ingreso */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Ingreso</h2>
            <p className="text-sm text-fg-60">Forma de pago y datos bancarios</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Importe (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.ingreso?.importe || ""}
              onChange={(e) => handleInputChange('ingreso', 'importe', e.target.value)}
              placeholder="0.00"
              className="font-bold text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-fg-50 mb-2">
              Forma de Pago
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ingreso?.forma_pago?.efectivo || false}
                  onChange={(e) => handleCheckboxChange('ingreso', 'forma_pago', 'efectivo', e.target.checked)}
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                />
                <span className="text-sm text-fg-50">Efectivo</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ingreso?.forma_pago?.adeudo_en_cuenta || false}
                  onChange={(e) => handleCheckboxChange('ingreso', 'forma_pago', 'adeudo_en_cuenta', e.target.checked)}
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                />
                <span className="text-sm text-fg-50">Adeudo en Cuenta</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cuenta Bancaria */}
        {formData.ingreso?.forma_pago?.adeudo_en_cuenta && (
          <div className="p-4 bg-bg-60 rounded-lg">
            <h3 className="text-sm font-semibold text-fg-50 mb-3">Cuenta Bancaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Entidad
                </label>
                <Input
                  type="text"
                  maxLength="4"
                  value={formData.ingreso?.cuenta_bancaria?.entidad || ""}
                  onChange={(e) => handleNestedInputChange('ingreso', 'cuenta_bancaria', 'entidad', e.target.value)}
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
                  value={formData.ingreso?.cuenta_bancaria?.sucursal || ""}
                  onChange={(e) => handleNestedInputChange('ingreso', 'cuenta_bancaria', 'sucursal', e.target.value)}
                  placeholder="0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  DC
                </label>
                <Input
                  type="text"
                  maxLength="2"
                  value={formData.ingreso?.cuenta_bancaria?.dc || ""}
                  onChange={(e) => handleNestedInputChange('ingreso', 'cuenta_bancaria', 'dc', e.target.value)}
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
                  value={formData.ingreso?.cuenta_bancaria?.numero_cuenta || ""}
                  onChange={(e) => handleNestedInputChange('ingreso', 'cuenta_bancaria', 'numero_cuenta', e.target.value)}
                  placeholder="0000000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anexo - Placeholder */}
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Anexos</h2>
            <p className="text-sm text-fg-60">Sujetos pasivos y transmitentes adicionales</p>
          </div>
        </div>
        
        <div className="bg-bg-60 border border-bd-40 rounded-lg p-4">
          <p className="text-sm text-fg-60 text-center">
            📋 Sección de anexos disponible para múltiples sujetos pasivos y transmitentes
          </p>
          <p className="text-xs text-fg-70 text-center mt-2">
            Incluye campos: coeficiente_participacion, nif_dni, nombre_apellidos, dirección completa, teléfono, fax, etiqueta_identificativa
          </p>
        </div>
      </div>
    </>
  );
};

export default Modelo600NewExtended;