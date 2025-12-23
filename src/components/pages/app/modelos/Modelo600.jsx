// Modelo 600 - Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados
import React, { useState } from "react";
import { ArrowLeft, Save, FileText, User, Building, Calculator, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select } from "../../../ui";
import Modelo600Extended from "./Modelo600Extended";

const Modelo600 = () => {
  const navigate = useNavigate();

  // Complete form state based on the provided JSON structure
  const [formData, setFormData] = useState({
    administracion: {
      delegacion_de: "",
      codigo_administracion: ""
    },
    sujeto_pasivo: {
      nif_dni: "",
      apellidos_y_nombre_o_razon_social: "",
      calle_plaza_avenida: "",
      n: "",
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: ""
    },
    etiqueta_identificativa: {
      provincia: "",
      identificacion: "",
      local_formalizacion_organo: "",
      otros_identificativos: ""
    },
    transmitente: {
      nif_dni: "",
      apellidos_y_nombre_o_razon_social: "",
      calle_plaza_avenida: "",
      n: "",
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: ""
    },
    concepto: {
      clave_concepto: "",
      devengo_dia: "",
      devengo_mes: "",
      devengo_ano: ""
    },
    numero_sujetos_pasivos_transmitentes: "",
    datos_liquidacion: {
      valor_catastral: "",
      referencia_catastral: "",
      base_imponible: "",
      reduccion: "",
      tipo: "",
      bonificacion: "",
      cuota: "",
      cuota_complementaria: "",
      liq_complementaria: "",
      importe_ingresar: ""
    },
    autoliquidacion_complementaria: {
      si_no: "",
      fecha_presentacion_liquidacion_anterior: ""
    },
    total_ingresar: "",
    etiqueta_identificativa_representante: {
      nif_dni: "",
      apellidos_y_nombre_o_razon_social: "",
      calle_plaza_avenida: "",
      n: "",
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: "",
      fax: ""
    },
    forma_pago: {
      entidad: "",
      sucursal: "",
      codigo_cuenta: "",
      dc: "",
      num_cuenta: "",
      importe: ""
    },
    firma_sujeto_pasivo_presentador: "",
    anexo_sujetos_pasivos_transmitentes: [],
    anexo_transmitentes: [],
    firma_sujeto_pasivo_presentador_anexo: ""
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                size="icon"
                onClick={() => navigate("/app/modelos")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-fg-40">Modelo 600</h1>
                <p className="text-sm text-fg-60 mt-1">
                  Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button variant="primary">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
        {/* Form Content */}
        <div className="py-4 space-y-6">
          {/* Administración Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Administración</h2>
                <p className="text-sm text-fg-60">Datos de la administración tributaria</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Delegación de
                </label>
                <Input
                  type="text"
                  value={formData.administracion.delegacion_de}
                  onChange={(e) => handleInputChange('administracion', 'delegacion_de', e.target.value)}
                  placeholder="Ingrese delegación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Administración
                </label>
                <Input
                  type="text"
                  value={formData.administracion.codigo_administracion}
                  onChange={(e) => handleInputChange('administracion', 'codigo_administracion', e.target.value)}
                  placeholder="Código"
                />
              </div>
            </div>
          </div>

          {/* Sujeto Pasivo Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Sujeto Pasivo</h2>
                <p className="text-sm text-fg-60">Datos del contribuyente</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  NIF/DNI *
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.nif_dni}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'nif_dni', e.target.value)}
                  placeholder="12345678A"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Apellidos y Nombre o Razón Social *
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.apellidos_y_nombre_o_razon_social}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'apellidos_y_nombre_o_razon_social', e.target.value)}
                  placeholder="Apellidos, Nombre o Razón Social"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Calle/Plaza/Avenida
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.calle_plaza_avenida}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'calle_plaza_avenida', e.target.value)}
                  placeholder="Dirección"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.n}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'n', e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Municipio
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.municipio}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.provincia}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Postal
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.codigo_postal}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'codigo_postal', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.sujeto_pasivo.telefono}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'telefono', e.target.value)}
                  placeholder="600123456"
                />
              </div>
            </div>
          </div>
          {/* Etiqueta Identificativa Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Etiqueta Identificativa</h2>
                <p className="text-sm text-fg-60">Datos identificativos del documento</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.etiqueta_identificativa.provincia}
                  onChange={(e) => handleInputChange('etiqueta_identificativa', 'provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Identificación
                </label>
                <Input
                  type="text"
                  value={formData.etiqueta_identificativa.identificacion}
                  onChange={(e) => handleInputChange('etiqueta_identificativa', 'identificacion', e.target.value)}
                  placeholder="Identificación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Local Formalización Órgano
                </label>
                <Input
                  type="text"
                  value={formData.etiqueta_identificativa.local_formalizacion_organo}
                  onChange={(e) => handleInputChange('etiqueta_identificativa', 'local_formalizacion_organo', e.target.value)}
                  placeholder="Local formalización"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Otros Identificativos
                </label>
                <Input
                  type="text"
                  value={formData.etiqueta_identificativa.otros_identificativos}
                  onChange={(e) => handleInputChange('etiqueta_identificativa', 'otros_identificativos', e.target.value)}
                  placeholder="Otros datos"
                />
              </div>
            </div>
          </div>

          {/* Transmitente Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Transmitente</h2>
                <p className="text-sm text-fg-60">Datos del transmitente</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  NIF/DNI
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.nif_dni}
                  onChange={(e) => handleInputChange('transmitente', 'nif_dni', e.target.value)}
                  placeholder="12345678A"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Apellidos y Nombre o Razón Social
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.apellidos_y_nombre_o_razon_social}
                  onChange={(e) => handleInputChange('transmitente', 'apellidos_y_nombre_o_razon_social', e.target.value)}
                  placeholder="Apellidos, Nombre o Razón Social"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Calle/Plaza/Avenida
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.calle_plaza_avenida}
                  onChange={(e) => handleInputChange('transmitente', 'calle_plaza_avenida', e.target.value)}
                  placeholder="Dirección"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.n}
                  onChange={(e) => handleInputChange('transmitente', 'n', e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Municipio
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.municipio}
                  onChange={(e) => handleInputChange('transmitente', 'municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.provincia}
                  onChange={(e) => handleInputChange('transmitente', 'provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Postal
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.codigo_postal}
                  onChange={(e) => handleInputChange('transmitente', 'codigo_postal', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.transmitente.telefono}
                  onChange={(e) => handleInputChange('transmitente', 'telefono', e.target.value)}
                  placeholder="600123456"
                />
              </div>
            </div>
          </div>
          {/* Concepto Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Concepto</h2>
                <p className="text-sm text-fg-60">Datos del concepto y devengo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Clave Concepto
                </label>
                <Select
                  value={formData.concepto.clave_concepto}
                  onChange={(e) => handleInputChange('concepto', 'clave_concepto', e.target.value)}
                >
                  <option value="">Seleccionar concepto</option>
                  <option value="01">01 - Transmisiones onerosas de bienes inmuebles</option>
                  <option value="02">02 - Transmisiones onerosas de bienes muebles</option>
                  <option value="03">03 - Constitución de derechos reales</option>
                  <option value="04">04 - Arrendamientos de bienes inmuebles</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Día
                </label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.concepto.devengo_dia}
                  onChange={(e) => handleInputChange('concepto', 'devengo_dia', e.target.value)}
                  placeholder="DD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Mes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.concepto.devengo_mes}
                  onChange={(e) => handleInputChange('concepto', 'devengo_mes', e.target.value)}
                  placeholder="MM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Año
                </label>
                <Input
                  type="number"
                  min="2000"
                  max="2030"
                  value={formData.concepto.devengo_ano}
                  onChange={(e) => handleInputChange('concepto', 'devengo_ano', e.target.value)}
                  placeholder="YYYY"
                />
              </div>
            </div>
          </div>

          {/* Extended Sections */}
          <Modelo600Extended formData={formData} setFormData={setFormData} />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-bd-50">
            <Button 
              variant="secondary"
              onClick={() => navigate("/app/modelos")}
            >
              Cancelar
            </Button>
            <Button variant="primary">
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button variant="primary" className="bg-green-600 hover:bg-green-700">
              <FileText className="w-4 h-4 mr-2" />
              Generar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modelo600;