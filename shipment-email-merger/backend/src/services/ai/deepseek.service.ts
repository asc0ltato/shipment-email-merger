import axios from 'axios';
import { IEmail } from '@/models/email';
import { ShipmentRequest } from '@/models/summary';
import { logger } from '@/utils';

export class DeepseekService {
    private static instance: DeepseekService;
    private apiUrl: string = '';
    private modelName: string = 'gemini-3-pro-preview:latest';
    private isEnabled: boolean = false;

    private constructor() {}

    public static getInstance(): DeepseekService {
        if (!DeepseekService.instance) {
            DeepseekService.instance = new DeepseekService();
            DeepseekService.instance.initialize();
        }
        return DeepseekService.instance;
    }

    private initialize(): void {
        try {
            // URL для Ollama API (в Docker сети используем имя сервиса, локально - localhost)
            const ollamaHost = process.env.OLLAMA_HOST || 'ollama';
            const ollamaPort = process.env.OLLAMA_PORT || '11434';
            this.apiUrl = `http://${ollamaHost}:${ollamaPort}/api/chat`;
            
            // Имя модели Ollama (по умолчанию gemma2:2b, но можно использовать другую модель)
            this.modelName = process.env.OLLAMA_MODEL || 'gemini-3-pro-preview:latest';

            logger.info('Ollama service initialization');
            logger.info(`Ollama URL: ${this.apiUrl}`);
            logger.info(`Ollama Model: ${this.modelName}`);

            // Ollama не требует API ключ, поэтому всегда включен
            this.isEnabled = true;
            logger.info('Ollama service initialized successfully');
        } catch (error) {
            logger.error('Error initializing Ollama service:', error);
            this.isEnabled = false;
        }
    }

    public isMeaningfulAnalysis(structuredData: ShipmentRequest): boolean {
        if (!structuredData.pre_shipments || structuredData.pre_shipments.length === 0) {
            return false;
        }

        const shipment = structuredData.pre_shipments[0];

        const hasValidStringValue = (value: any, invalidPatterns: string[]): boolean => {
            return value !== null && 
                value !== undefined && 
                typeof value === 'string' &&
                value.length > 0 &&
                !invalidPatterns.some(pattern => value.includes(pattern));
        };

        const hasAnyRealData = 
            hasValidStringValue(shipment.shipping_date_from, ['дата', 'date in format', 'date']) ||
            hasValidStringValue(shipment.shipping_date_to, ['дата', 'date in format', 'date']) ||
            hasValidStringValue(shipment.arrival_date_from, ['дата', 'date in format', 'date']) ||
            hasValidStringValue(shipment.arrival_date_to, ['дата', 'date in format', 'date']) ||

            hasValidStringValue(shipment.address_from?.city, ['город', 'city', 'select city']) ||
            hasValidStringValue(shipment.address_from?.country, ['страна', 'country', 'select country']) ||
            hasValidStringValue(shipment.address_from?.address, ['адрес', 'address', 'enter address']) ||
            hasValidStringValue(shipment.address_dest?.city, ['город', 'city', 'select city']) ||
            hasValidStringValue(shipment.address_dest?.country, ['страна', 'country', 'select country']) ||
            hasValidStringValue(shipment.address_dest?.address, ['адрес', 'address', 'enter address']) ||

            (shipment.contents.length > 0 && 
            hasValidStringValue(shipment.contents[0]?.type?.name, ['Unknown', 'тип груза', 'Unknown type', 'груз', 'cargo type'])) ||

            (structuredData.modes.length > 0 &&
            hasValidStringValue(structuredData.modes[0]?.name, ['Unknown', 'вид перевозки', 'Unknown mode', 'transport mode'])) ||

            hasValidStringValue(structuredData.for_carriers, ['информация для перевозчиков', 'information for carriers', 'carrier info']) ||
            
            (structuredData.name !== null && 
            structuredData.name !== undefined &&
            hasValidStringValue(structuredData.name, ['название груза', 'Shipment name', 'груз', 'cargo', 'test']) && 
            structuredData.name.length > 5);

        logger.debug('Meaningful analysis check result:', { 
            hasAnyRealData,
            name: structuredData.name,
            nameLength: structuredData.name?.length,
            dates: {
                shipping_from: shipment.shipping_date_from,
                shipping_to: shipment.shipping_date_to,
                arrival_from: shipment.arrival_date_from,
                arrival_to: shipment.arrival_date_to
            },
            addresses: {
                from_city: shipment.address_from?.city,
                from_country: shipment.address_from?.country,
                dest_city: shipment.address_dest?.city,
                dest_country: shipment.address_dest?.country
            },
            contents: shipment.contents.length,
            modes: structuredData.modes.length
        });
        
        return hasAnyRealData;
    }

    async generateStructuredEmailGroupData(emails: IEmail[]): Promise<ShipmentRequest> {
        if (!this.isEnabled) {
            throw new Error('AI service disabled: Ollama service not available');
        }

        if (!emails || emails.length === 0) {
            throw new Error('No emails for analysis');
        }

        let response;
            try {
            logger.info(`Starting structured AI analysis for ${emails.length} emails`);
            
            emails.forEach((email, index) => {
                logger.debug(`Email ${index + 1}:`, {
                    subject: email.subject,
                    text_preview: email.text?.substring(0, 200) + '...',
                    has_order_number: email.text?.includes('BY-') || email.subject?.includes('BY-')
                });
            });

            const prompt = this.createAnalysisPrompt(emails);
            response = await this.makeAIRequest(prompt);

            const structuredData = this.parseAIResponse(response);

            logger.debug('AI analysis raw result:', {
                name: structuredData.name,
                pre_shipments_count: structuredData.pre_shipments?.length,
                modes_count: structuredData.modes?.length,
                has_for_carriers: !!structuredData.for_carriers,
                raw_data: JSON.stringify(structuredData, null, 2)
            });

            const hasUsefulData = this.isMeaningfulAnalysis(structuredData);

            if (!hasUsefulData) {
                logger.warn('AI analysis completed but no structured information was found in the emails');
                logger.warn('Email subjects:', emails.map(e => e.subject));
            } else {
                logger.info('Structured AI analysis completed successfully with useful data');
            }

            return structuredData;
        } catch (error: any) {
            logger.error('Structured AI analysis error:', error);

            if (error.message.includes('JSON') || error.message.includes('network') || error.message.includes('timeout')) {
                throw new Error(`Structured AI analysis failed: ${error.message}`);
            }
            if (response) {
                try {
                    logger.warn('AI analysis completed with minimal data, returning what we have');
                    return this.parseAIResponse(response);
                } catch (parseError) {
                    throw new Error(`Structured AI analysis failed: ${error.message}`);
                }
            }

            throw new Error(`Structured AI analysis failed: ${error.message}`);
        }
    }

    private createAnalysisPrompt(emails: IEmail[]): string {
        const emailContext = this.formatEmailContext(emails);

        return `
            Ты - эксперт по анализу электронных писем о грузоперевозках. Твоя задача - извлечь ВСЮ доступную информацию из писем.

            ИНСТРУКЦИИ ПО ПОИСКУ ИНФОРМАЦИИ:

            1. ID ЗАКАЗА (поле "name"):
            ГДЕ ИСКАТЬ: тема письма
            ПАТТЕРНЫ: 
            - BY-123456, BY-784512, BY-987123 (формат: 2 буквы + дефис + 6-8 цифр)
            - "Заказ BY-123", "Order: BY-456", "Номер: BY-789"
            - "№ BY-123", "ID: BY-456", "Tracking: BY-789"
            ПРИМЕРЫ: "Заказ BY-987123", "Order BY-784512", "BY-123456 отменен"

            2. ДАТЫ ОТПРАВКИ (shipping_date_from/to):
            ГДЕ ИСКАТЬ: тело письма 
            КЛЮЧЕВЫЕ СЛОВА: "дата отправки", "дата загрузки", "дата отгрузки", "отправка", "загрузка", "отгрузка", "shipment date", "shipping date"
            ФОРМАТЫ: "15.12.2024", "15-12-2024", "15/12/2024", "2024-12-15", "15 декабря 2024", "15 дек 2024"
            ПРИМЕРЫ: "Отправка 15.12.2024", "Дата загрузки: 15-12-2024", "Shipping: 2024-12-15"
            ВАЖНО: Конвертируй в формат DD-MM-YYYY

            3. ВРЕМЯ ОТПРАВКИ (shipping_time_from/to):
            ГДЕ ИСКАТЬ: рядом с датой отправки
            ФОРМАТЫ: "09:00", "9:00", "9 утра", "09:30", "14:00", "2 часа дня"
            ПРИМЕРЫ: "в 09:00", "с 9:00 до 13:00", "время: 09:30"

            4. ДАТЫ ПРИБЫТИЯ (arrival_date_from/to):
            ГДЕ ИСКАТЬ: тело письма
            КЛЮЧЕВЫЕ СЛОВА: "дата доставки", "дата прибытия", "дата получения", "доставка", "прибытие", "arrival", "delivery date"
            ФОРМАТЫ: те же, что и для отправки
            ПРИМЕРЫ: "Доставка 17.12.2024", "Прибытие: 17-12-2024", "Arrival: 2024-12-17"

            5. АДРЕС ОТПРАВЛЕНИЯ (address_from):
            ГДЕ ИСКАТЬ: тело письма
            КЛЮЧЕВЫЕ СЛОВА: "откуда", "отправка из", "адрес отправки", "склад отправки", "отправитель", "from", "origin"
            ЧТО ИСКАТЬ:
            - Страна: "Беларусь", "Россия", "Украина", "Belarus", "Russia"
            - Город: "Минск", "Москва", "Гродно", "Минске", "г. Минск"
            - Адрес: "ул. Тимирязева, 65", "улица Ожешко, д. 15", "проспект Победителей, 65А"
            - Индекс: "220000"
            ПРИМЕРЫ: "Минск, ул. Тимирязева, д. 65А, склад №2", "г. Минск, ул. Тимирязева, 65"

            6. АДРЕС НАЗНАЧЕНИЯ (address_dest):
            ГДЕ ИСКАТЬ: тело письма, подпись
            КЛЮЧЕВЫЕ СЛОВА: "куда", "доставка в", "адрес доставки", "получатель", "destination", "to", "delivery address"
            ЧТО ИСКАТЬ: те же компоненты что и для address_from
            ПРИМЕРЫ: "Гродно, ул. Ожешко, 15", "г. Гродно, ул. Ожешко, д. 15"

            7. ГРУЗ (contents[0].type):
            ГДЕ ИСКАТЬ: тело письма, тема
            КЛЮЧЕВЫЕ СЛОВА: "груз", "товар", "наименование", "описание груза", "cargo", "goods", "shipment"
            ЧТО ИСКАТЬ:
            - name: "Электронные компоненты", "Промышленное оборудование", "Бытовая техника"
            - shortname: ИЩИ КОРОТКОЕ НАЗВАНИЕ:
                * "Краткое название: ЭК", "Сокращение: Пром.оборуд.", "Аббревиатура: БТ"
                * "Короткое имя: Компоненты", "Short: Components"
                * Если есть короткое название или аббревиатура - извлекай в shortname
            - width/length/height: ИЩИ ГАБАРИТЫ В ЛЮБОМ ФОРМАТЕ:
                * "40x30x25 см", "40 x 30 x 25 см", "40×30×25 см"
                * "размеры: 40 см x 30 см x 25 см"
                * "Габариты: 40x30x25 см" (ОБЯЗАТЕЛЬНО ИЗВЛЕКАЙ!)
                * "40x30x25", "1.5x1.2x2 м", "150x120x200 см"
                * Формат: длина x ширина x высота (или ширина x длина x высота)
                * Если указано "40x30x25 см" - извлекай: length=40, width=30, height=25
            - height_edit/width_edit/length_edit: ИЩИ ИЗМЕНЕНИЯ РАЗМЕРОВ:
                * "высота изменена на 30 см", "новая высота: 30", "height changed to 30"
                * "ширина изменена", "новая ширина", "width updated", "изменена длина"
                * "корректировка размеров", "обновлены габариты"
                * Если есть упоминание об изменении размеров - ставь соответствующий флаг в true
            - dimension_unit: ИЩИ ЕДИНИЦЫ ИЗМЕРЕНИЯ:
                * "коробки", "мешки", "ящики", "пакеты", "контейнеры", "поддоны", "паллеты"
                * "кг", "килограммы", "тонны", "литры", "куб.м", "м³"
                * "штуки", "шт", "единицы", "pieces", "units"
                * "упаковки", "банки", "бутылки", "канистры"
                * Если указаны единицы измерения - ставь dimension_unit в true
            - is_container: ИЩИ УПОМИНАНИЕ КОНТЕЙНЕРА:
                * "контейнер", "container", "контейнерная перевозка"
                * "в контейнере", "контейнерный груз", "containerized cargo"
                * "20-футовый контейнер", "40-футовый контейнер", "20ft", "40ft"
                * Если груз перевозится в контейнере или является контейнером - ставь is_container в true
            - quantity: "1 шт", "количество: 5", "5 единиц"
            - ВЕС: ИЩИ В ЛЮБОМ ФОРМАТЕ:
                * "Вес: 5.2 кг", "вес 5.2 кг", "масса: 5.2 кг"
                * "5.2 кг", "вес 5,2 кг", "weight: 5.2 kg"
                * Если найден вес - добавь его в for_carriers или в описание груза
            ПРИМЕРЫ: 
            - "Груз: Электронные компоненты (ЭК), 1 шт, Габариты: 40x30x25 см, Вес: 5.2 кг, в контейнере"
            - "Вес: 5.2 кг\nГабариты: 40x30x25 см\nВысота изменена на 30 см\nЕдиницы: коробки"
            - "Контейнерная перевозка, 20-футовый контейнер, груз: Промышленное оборудование"

            8. ВИД ПЕРЕВОЗКИ (modes[0].name):
            ГДЕ ИСКАТЬ: тело письма, тема
            КЛЮЧЕВЫЕ СЛОВА: "вид перевозки", "тип доставки", "способ доставки", "transport mode", "delivery type"
            ПРИМЕРЫ: "Наземная доставка", "Авиаперевозка", "Морская перевозка", "Железнодорожная", "Автоперевозка"

            9. ИНФОРМАЦИЯ ДЛЯ ПЕРЕВОЗЧИКОВ (for_carriers):
            ГДЕ ИСКАТЬ: конец письма, контакты
            ЧТО ИСКАТЬ: телефоны, email, паспортные данные, комментарии, реквизиты, ВЕС (если указан отдельно)
            ПРИМЕРЫ: "+375 29 123-45-67", "email@example.com", "паспорт: AB1234567", "Вес: 5.2 кг"

            ОБЩИЕ ПРАВИЛА:

            1. Анализируй ВСЕ письма последовательно - информация может быть распределена
            2. Ищи в теме письма ПЕРВЫМ - там часто ключевая информация
            3. Даже если заказ ОТМЕНЕН - извлекай всю информацию (даты, адреса, груз, вес, габариты)
            4. Если информация отсутствует - используй null (без кавычек в JSON) для полей, которые могут быть null
            5. НИКОГДА не используй дефолтные значения типа "00:00", "0000-00-00", "Unknown" - если информации нет, используй null
            6. ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (не могут быть null):
               - name (может быть пустой строкой если не найден)
               - is_ai_generated (всегда true)
               - upload_id (всегда "ai_" + timestamp)
               - pre_shipments (массив, может быть пустым, но должен присутствовать)
               - pre_shipments[0].address_from (объект обязателен, но поля внутри могут быть null)
               - pre_shipments[0].address_dest (объект обязателен, но поля внутри могут быть null)
               - pre_shipments[0].contents (массив обязателен, может быть пустым)
               - pre_shipments[0].contents[0].type.name (обязательно, если contents не пустой)
               - pre_shipments[0].contents[0].quantity (обязательно, минимум 1, если contents не пустой)
               - modes (массив обязателен, может быть пустым)
               - modes[0].name (обязательно, если modes не пустой)
            7. ПОЛЯ КОТОРЫЕ МОГУТ БЫТЬ null:
               - Все даты и время (shipping_date_from/to, shipping_time_from/to, arrival_date_from/to, arrival_time_from/to)
               - address_from и address_dest: country, city, zipcode, address, date_from, date_to, time_from, time_to (все могут быть null, кроме id)
               - for_carriers (опциональное поле, может отсутствовать или быть null)
            8. Для upload_id используй: "ai_" + timestamp
            9. Не придумывай информацию - используй только то, что есть в письмах
            10. Если информации мало - верни JSON с тем, что нашел (null для остального, но обязательные поля должны присутствовать)
            11. Будь внимателен к деталям - даже короткие письма могут содержать важную информацию
            
            Требуемый формат JSON:
            ${this.getJsonSchema()}
            
            Письма для анализа:
            ${emailContext}
            
            Верни ТОЛЬКО JSON без дополнительного текста, комментариев и объяснений.
            Даже если информации мало - верни JSON с тем, что нашел.
        `.trim();
    }

    private formatEmailContext(emails: IEmail[]): string {
        return emails
            .map((email, index) => {
                const date = new Date(email.date);
                const emailText = (email as any).text || '';
                return `
            Email ${index + 1}:
            Date: ${date.toLocaleDateString('ru-RU')}
            Subject: ${email.subject}
            From: ${email.from}
            To: ${email.to}
            Text: ${emailText.substring(0, 800)}${emailText.length > 800 ? '...' : ''}
                    `.trim();
            })
            .join('\n\n');
    }

    private getJsonSchema(): string {
        return `{
            "name": "ID заказа (ОБЯЗАТЕЛЬНОЕ ПОЛЕ, строка, может быть пустой строкой если не найден)",
            "is_ai_generated": true,
            "upload_id": "уникальный идентификатор загрузки (ОБЯЗАТЕЛЬНОЕ ПОЛЕ, формат: 'ai_' + timestamp, например: ai_1731446400)",
            "pre_shipments": [
                {
                    "shipping_date_from": "дата начала отправки в формате DD-MM-YYYY (null если не указана)",
                    "shipping_date_to": "дата окончания отправки в формате DD-MM-YYYY (null если не указана)",
                    "shipping_time_from": "время начала отправки в формате HH:MM (null если не указано, НЕ использовать '00:00')",
                    "shipping_time_to": "время окончания отправки в формате HH:MM (null если не указано, НЕ использовать '00:00')",
                    "arrival_date_from": "дата начала прибытия в формате DD-MM-YYYY (null если не указана)",
                    "arrival_date_to": "дата окончания прибытия в формате DD-MM-YYYY (null если не указана)",
                    "arrival_time_from": "время начала прибытия в формате HH:MM (null если не указано, НЕ использовать '00:00')",
                    "arrival_time_to": "время окончания прибытия в формате HH:MM (null если не указано, НЕ использовать '00:00')",
                    "address_from": {
                        "id": 1,
                        "country": "страна отправления (null если не указана, например: Беларусь)",
                        "city": "город отправления (null если не указан, например: Минск)",
                        "zipcode": "почтовый индекс места отправления (null если не указан)",
                        "address": "полный адрес отправления (null если не указан, например: ул. Тимирязева, д. 65А, склад №2)",
                        "date_from": "дата начала (null если не указана)",
                        "date_to": "дата окончания (null если не указана)",
                        "time_from": "время начала (null если не указано)",
                        "time_to": "время окончания (null если не указано)"
                    },
                    "address_dest": {
                        "id": 1,
                        "country": "страна назначения (null если не указана, например: Беларусь)",
                        "city": "город назначения (null если не указан, например: Гродно)",
                        "zipcode": "почтовый индекс места назначения (null если не указан)",
                        "address": "полный адрес назначения (null если не указан, например: ул. Ожешко, 15)",
                        "date_from": "дата начала (null если не указана)",
                        "date_to": "дата окончания (null если не указана)",
                        "time_from": "время начала (null если не указано)",
                        "time_to": "время окончания (null если не указано)"
                    },
                    "contents": [
                        {
                            "type": {
                                "id": 1,
                                "name": "название груза (ОБЯЗАТЕЛЬНОЕ ПОЛЕ, строка, например: Электронные компоненты)",
                                "width": "ширина груза в сантиметрах (ЧИСЛО, может быть 0 если не указано, например: 30). ИЩИ в форматах: '40x30x25 см', 'Габариты: 40x30x25 см', 'размеры 40 см x 30 см x 25 см'. Если указано '40x30x25 см' - width=30 (второе число)",
                                "length": "длина груза в сантиметрах (ЧИСЛО, может быть 0 если не указано, например: 40). ИЩИ в форматах: '40x30x25 см', 'Габариты: 40x30x25 см'. Если указано '40x30x25 см' - length=40 (первое число)",
                                "height": "высота груза в сантиметрах (ЧИСЛО, может быть 0 если не указано, например: 25). ИЩИ в форматах: '40x30x25 см', 'Габариты: 40x30x25 см'. Если указано '40x30x25 см' - height=25 (третье число)",
                                "height_edit": "была ли изменена высота груза (true если есть упоминания: 'высота изменена', 'новая высота', 'height changed', 'корректировка высоты', иначе false)",
                                "width_edit": "была ли изменена ширина груза (true если есть упоминания: 'ширина изменена', 'новая ширина', 'width updated', 'корректировка ширины', иначе false)",
                                "length_edit": "была ли изменена длина груза (true если есть упоминания: 'длина изменена', 'новая длина', 'length changed', 'корректировка длины', иначе false)",
                                "dimension_unit": "указаны ли единицы измерения (true если есть: 'коробки', 'мешки', 'ящики', 'пакеты', 'контейнеры', 'кг', 'литры', 'штуки', 'упаковки', иначе false)",
                                "shortname": "короткое название или аббревиатура груза (строка, например: 'ЭК', 'Пром.оборуд.', 'БТ', или false если не указано)",
                                "is_container": "является ли груз контейнером или перевозится в контейнере (true если есть: 'контейнер', 'container', 'контейнерная перевозка', '20-футовый', '40-футовый', иначе false)"
                            },
                            "quantity": "количество груза (ОБЯЗАТЕЛЬНОЕ ПОЛЕ, ЧИСЛО, минимум 1)"
                        }
                    ]
                }
            ],
            "modes": [
                {
                    "id": 1,
                    "name": "вид перевозки (ОБЯЗАТЕЛЬНОЕ ПОЛЕ, строка, например: Наземная доставка, Авиаперевозка, Морская перевозка)"
                }
            ],
            "for_carriers": "информация для перевозчиков (ОПЦИОНАЛЬНОЕ ПОЛЕ, может отсутствовать или быть null, номер телефона, контакты, email, комментарии, реквизиты, паспортные данные и другое)"
        }`;
    }

    private async makeAIRequest(prompt: string): Promise<any> {
        return await axios.post(this.apiUrl, {
            model: this.modelName,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            options: {
                temperature: 0.1,
                num_predict: 4000
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 120000 // Увеличиваем таймаут для локальной модели
        });
    }

    private parseAIResponse(response: any): ShipmentRequest {
        // Ollama API возвращает ответ в формате: { message: { content: "..." } }
        if (!response.data.message || !response.data.message.content) {
            logger.error('Invalid response format from Ollama service');
            logger.error('Response data:', JSON.stringify(response.data, null, 2));
            throw new Error('Invalid Ollama response format');
        }

        const jsonText = response.data.message.content;
        const cleanJson = this.cleanJsonResponse(jsonText);

        try {
            return JSON.parse(cleanJson);
        } catch (parseError) {
            logger.error('JSON parsing error from AI response:', parseError);
            logger.error('Raw response content:', jsonText.substring(0, 500));
            throw new Error('Failed to parse AI response as JSON');
        }
    }

    private cleanJsonResponse(jsonText: string): string {
        return jsonText.replace(/```json\n?|\n?```/g, '').trim();
    }

    formatStructuredDataToText(structuredData: ShipmentRequest): string {
        if (!structuredData.pre_shipments || structuredData.pre_shipments.length === 0) {
            return `СТРУКТУРИРОВАННАЯ ИНФОРМАЦИЯ О ГРУЗЕ\n\nНазвание: ${structuredData.name || 'Не указано'}\nID загрузки: ${structuredData.upload_id || 'Не указано'}\n`;
        }

        const shipment = structuredData.pre_shipments[0];
        let text = `СТРУКТУРИРОВАННАЯ ИНФОРМАЦИЯ О ГРУЗЕ\n\n`;
        
        if (structuredData.name) {
            text += `Название: ${structuredData.name}\n`;
        }
        
        if (structuredData.upload_id) {
            text += `ID загрузки: ${structuredData.upload_id}\n`;
        }
        
        text += `\n`;

        if (shipment.address_from) {
            const fromParts: string[] = [];
            if (shipment.address_from.address) fromParts.push(shipment.address_from.address);
            if (shipment.address_from.city) fromParts.push(shipment.address_from.city);
            if (shipment.address_from.zipcode) fromParts.push(shipment.address_from.zipcode);
            if (shipment.address_from.country) fromParts.push(shipment.address_from.country);
            
            if (fromParts.length > 0) {
                text += `Отправление: ${fromParts.join(', ')}\n`;
            }
        }

        if (shipment.address_dest) {
            const destParts: string[] = [];
            if (shipment.address_dest.address) destParts.push(shipment.address_dest.address);
            if (shipment.address_dest.city) destParts.push(shipment.address_dest.city);
            if (shipment.address_dest.zipcode) destParts.push(shipment.address_dest.zipcode);
            if (shipment.address_dest.country) destParts.push(shipment.address_dest.country);
            
            if (destParts.length > 0) {
                text += `Назначение: ${destParts.join(', ')}\n`;
            }
        }

        if (shipment.shipping_date_from || shipment.shipping_date_to) {
            const shippingDates: string[] = [];
            if (shipment.shipping_date_from) {
                let dateStr = shipment.shipping_date_from;
                if (shipment.shipping_time_from) {
                    dateStr += ` ${shipment.shipping_time_from}`;
                }
                if (shipment.shipping_date_to && shipment.shipping_date_to !== shipment.shipping_date_from) {
                    dateStr += ` - ${shipment.shipping_date_to}`;
                    if (shipment.shipping_time_to) {
                        dateStr += ` ${shipment.shipping_time_to}`;
                    }
                }
                shippingDates.push(dateStr);
            } else if (shipment.shipping_date_to) {
                let dateStr = shipment.shipping_date_to;
                if (shipment.shipping_time_to) {
                    dateStr += ` ${shipment.shipping_time_to}`;
                }
                shippingDates.push(dateStr);
            }
            
            if (shippingDates.length > 0) {
                text += `Дата отправки: ${shippingDates.join(' - ')}\n`;
            }
        }

        if (shipment.arrival_date_from || shipment.arrival_date_to) {
            const arrivalDates: string[] = [];
            if (shipment.arrival_date_from) {
                let dateStr = shipment.arrival_date_from;
                if (shipment.arrival_time_from) {
                    dateStr += ` ${shipment.arrival_time_from}`;
                }
                if (shipment.arrival_date_to && shipment.arrival_date_to !== shipment.arrival_date_from) {
                    dateStr += ` - ${shipment.arrival_date_to}`;
                    if (shipment.arrival_time_to) {
                        dateStr += ` ${shipment.arrival_time_to}`;
                    }
                }
                arrivalDates.push(dateStr);
            } else if (shipment.arrival_date_to) {
                let dateStr = shipment.arrival_date_to;
                if (shipment.arrival_time_to) {
                    dateStr += ` ${shipment.arrival_time_to}`;
                }
                arrivalDates.push(dateStr);
            }
            
            if (arrivalDates.length > 0) {
                text += `Дата прибытия: ${arrivalDates.join(' - ')}\n`;
            }
        }

        if (shipment.contents && shipment.contents.length > 0) {
            const contentsList: string[] = [];
            shipment.contents.forEach((content, index) => {
                if (content.type && content.type.name && content.type.name !== 'Unknown') {
                    let contentStr = `${content.type.name}`;
                    if (content.quantity && content.quantity > 0) {
                        contentStr += ` x${content.quantity}`;
                    }
                    if (content.type.width && content.type.length && content.type.height) {
                        contentStr += ` (${content.type.length}x${content.type.width}x${content.type.height} см)`;
                    }
                    contentsList.push(contentStr);
                }
            });
            
            if (contentsList.length > 0) {
                text += `Груз: ${contentsList.join(', ')}\n`;
            }
        }

        if (structuredData.modes && structuredData.modes.length > 0) {
            const modesList: string[] = [];
            structuredData.modes.forEach((mode) => {
                if (mode.name && mode.name !== 'Unknown' && mode.name !== null) {
                    modesList.push(mode.name);
                }
            });
            
            if (modesList.length > 0) {
                text += `Тип перевозки: ${modesList.join(', ')}\n`;
            }
        }

        if (structuredData.for_carriers && 
            structuredData.for_carriers.trim() !== '' && 
            structuredData.for_carriers !== 'информация для перевозчиков' &&
            structuredData.for_carriers !== 'information for carriers') {
            text += `\nИнформация для перевозчиков: ${structuredData.for_carriers}\n`;
        }

        return text.trim();
    }
}