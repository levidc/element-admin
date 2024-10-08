export const statusCode = [
  { code: 'AccessDenied', description: 'Access Denied', description_cn: '拒绝访问' },
  { code: 'AccountProblem', description: 'There is a problem with your Amazon Web Services account that prevents the action from completing successfully. Contact Amazon Web Services Support for further assistance.', description_cn: '您的Amazon Web Services帐户存在问题，导致操作无法成功完成。请联系亚马逊网络服务支持以获得进一步帮助。' },
  { code: 'AllAccessDisabled', description: 'All access to this Amazon S3 resource has been disabled. Contact Amazon Web Services Support for further assistance.', description_cn: '已禁用对此Amazon S3资源的所有访问。请联系亚马逊网络服务支持以获得进一步帮助。' },
  { code: 'AmbiguousGrantByEmailAddress', description: 'The email address you provided is associated with more than one account.', description_cn: '您提供的电子邮件地址与多个帐户关联。' },
  { code: 'AuthorizationHeaderMalformed', description: 'The authorization header you provided is invalid.', description_cn: '您提供的授权标头无效。' },
  { code: 'BadDigest', description: 'The Content-MD5 you specified did not match what we received.', description_cn: '您指定的内容MD5与我们收到的内容不匹配。' },
  { code: 'BucketAlreadyExists', description: 'The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again.', description_cn: '请求的存储桶名称不可用。bucket命名空间由系统的所有用户共享。请选择其他名称，然后重试。' },
  { code: 'BucketAlreadyOwnedByYou', description: 'The bucket you tried to create already exists, and you own it. Amazon S3 returns this error in all Amazon Web Services Regions except in the North Virginia Region. For legacy compatibility, if you re-create an existing bucket that you already own in the North Virginia Region, Amazon S3 returns 200 OK and resets the bucket access control lists (ACLs).', description_cn: '您尝试创建的bucket已经存在，并且您拥有它。Amazon S3在除北弗吉尼亚州以外的所有Amazon Web服务区域返回此错误。为了保持传统兼容性，如果您重新创建一个在北弗吉尼亚州地区已经拥有的现有存储桶，Amazon S3将返回200 OK并重置存储桶访问控制列表（ACL）。' },
  { code: 'BucketNotEmpty', description: 'The bucket you tried to delete is not empty.', description_cn: '您试图删除的存储桶不是空的。' },
  { code: 'CredentialsNotSupported', description: 'This request does not support credentials.', description_cn: '此请求不支持凭据。' },
  { code: 'CrossLocationLoggingProhibited', description: 'Cross-location logging not allowed. Buckets in one geographic location cannot log information to a bucket in another location.', description_cn: '不允许跨位置记录。一个地理位置的存储桶无法将信息记录到另一个位置的存储桶中。' },
  { code: 'EntityTooSmall', description: 'Your proposed upload is smaller than the minimum allowed object size.', description_cn: '您提议的上载小于允许的最小对象大小。' },
  { code: 'EntityTooLarge', description: 'Your proposed upload exceeds the maximum allowed object size.', description_cn: '您提议的上载超过了允许的最大对象大小。' },
  { code: 'ExpiredToken', description: 'The provided token has expired.', description_cn: '提供的令牌已过期。' },
  { code: 'IllegalVersioningConfigurationException', description: 'Indicates that the versioning configuration specified in the request is invalid.', description_cn: '指示请求中指定的版本控制配置无效。' },
  { code: 'IncompleteBody', description: 'You did not provide the number of bytes specified by the Content-Length HTTP header', description_cn: '您没有提供内容长度HTTP标头指定的字节数' },
  { code: 'IncorrectNumberOfFilesInPostRequest', description: 'POST requires exactly one file upload per request.', description_cn: 'POST要求每个请求只上载一个文件。' },
  { code: 'InlineDataTooLarge', description: 'Inline data exceeds the maximum allowed size.', description_cn: '内联数据超过了允许的最大大小。' },
  { code: 'InternalError', description: 'We encountered an internal error. Please try again.', description_cn: '我们遇到了一个内部错误。请稍后再重试。' },
  { code: 'InvalidAccessKeyId', description: 'The Amazon Web Services access key ID you provided does not exist in our records.', description_cn: '您提供的亚马逊网络服务访问密钥ID在我们的记录中不存在。' },
  { code: 'InvalidAddressingHeader', description: 'You must specify the Anonymous role.', description_cn: '您必须指定匿名角色。' },
  { code: 'InvalidArgument', description: 'Invalid Argument', description_cn: '无效参数' },
  { code: 'InvalidBucketName', description: 'Bucket name contains invalid characters.', description_cn: '存储桶名称包含非法的字符。' },
  { code: 'InvalidBucketState', description: 'The request is not valid with the current state of the bucket.', description_cn: '该请求在存储桶的当前状态下无效。' },
  { code: 'InvalidDigest', description: 'The Content-MD5 you specified is not valid.', description_cn: '您指定的Content-MD5无效。' },
  { code: 'InvalidEncryptionAlgorithmError', description: 'The encryption request you specified is not valid. The valid value is AES256.', description_cn: '您指定的加密请求无效。有效值为AES256。' },
  { code: 'InvalidLocationConstraint', description: 'The specified location constraint is not valid. For more information about Regions, see How to Select a Region for Your Buckets.', description_cn: '指定的位置约束无效。有关区域的更多信息，请参阅How to Select a Region For Your Bucket。' },
  { code: 'InvalidObjectState', description: 'The action is not valid for the current state of the object.', description_cn: '该操作对于对象的当前状态无效。' },
  { code: 'InvalidPart', description: "One or more of the specified parts could not be found. The part might not have been uploaded, or the specified entity tag might not have matched the part's entity tag.", description_cn: '找不到一个或多个指定零件。部件可能尚未上载，或者指定的实体标记可能与部件的实体标记不匹配。' },
  { code: 'InvalidPartOrder', description: 'The list of parts was not in ascending order. Parts list must be specified in order by part number.', description_cn: '零件列表不是按升序排列的。零件清单必须按零件号顺序指定。' },
  { code: 'InvalidPayer', description: 'All access to this object has been disabled. Please contact Amazon Web Services Support for further assistance.', description_cn: '已禁用对此对象的所有访问。请联系亚马逊网络服务支持以获得进一步帮助。' },
  { code: 'InvalidPolicyDocument', description: 'The content of the form does not meet the conditions specified in the policy document.', description_cn: '表格内容不符合政策文件中规定的条件。' },
  { code: 'InvalidRange', description: 'The requested range cannot be satisfied.', description_cn: '无法满足请求的范围。' },
  { code: 'InvalidRequest', description: 'Please use AWS4-HMAC-SHA256.', description_cn: '请使用AWS4-HMAC-SHA256。' },
  { code: 'InvalidRequest', description: 'SOAP requests must be made over an HTTPS connection.', description_cn: 'SOAP请求必须通过HTTPS连接进行。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Acceleration is not supported for buckets with non-DNS compliant names.', description_cn: '对于具有不符合DNS的名称的存储桶，不支持Amazon S3传输加速。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Acceleration is not supported for buckets with periods (.) in their names.', description_cn: '具有句点（.）的存储桶不支持Amazon S3传输加速以他们的名义。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Accelerate endpoint only supports virtual style requests.', description_cn: 'Amazon S3 Transfer Accelerate端点仅支持虚拟样式请求。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Accelerate is not configured on this bucket.', description_cn: '此bucket上未配置Amazon S3 Transfer Accelerate。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Accelerate is disabled on this bucket.', description_cn: '在此存储桶上禁用了Amazon S3 Transfer Accelerate。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Acceleration is not supported on this bucket. Contact Amazon Web Services Support for more information.', description_cn: '此存储桶不支持Amazon S3传输加速。有关更多信息，请联系亚马逊网络服务支持。' },
  { code: 'InvalidRequest', description: 'Amazon S3 Transfer Acceleration cannot be enabled on this bucket. Contact Amazon Web Services Support for more information.', description_cn: '无法在此存储桶上启用Amazon S3传输加速。有关更多信息，请联系亚马逊网络服务支持。' },
  { code: 'InvalidSecurity', description: 'The provided security credentials are not valid.', description_cn: '提供的安全凭据无效。' },
  { code: 'InvalidSOAPRequest', description: 'The SOAP request body is invalid.', description_cn: 'SOAP请求正文无效。' },
  { code: 'InvalidStorageClass', description: 'The storage class you specified is not valid.', description_cn: '指定的存储类无效。' },
  { code: 'InvalidTargetBucketForLogging', description: 'The target bucket for logging does not exist, is not owned by you, or does not have the appropriate grants for the log-delivery group.', description_cn: '日志记录的目标存储桶不存在、不归您所有或没有日志传递组的适当授权。' },
  { code: 'InvalidToken', description: 'The provided token is malformed or otherwise invalid.', description_cn: '提供的令牌格式不正确或无效。' },
  { code: 'InvalidURI', description: "Couldn't parse the specified URI.", description_cn: '无法分析指定的URI。' },
  { code: 'KeyTooLongError', description: 'Your key is too long.', description_cn: '你的钥匙太长了。' },
  { code: 'MalformedACLError', description: 'The XML you provided was not well-formed or did not validate against our published schema.', description_cn: '您提供的XML格式不正确，或者没有根据我们发布的模式进行验证。' },
  { code: 'MalformedPOSTRequest', description: 'The body of your POST request is not well-formed multipart/form-data.', description_cn: 'POST请求的主体不是格式良好的多部分/表单数据。' },
  { code: 'MalformedXML', description: "This happens when the user sends malformed XML (XML that doesn't conform to the published XSD) for the configuration. The error message is, \"The XML you provided was not well-formed or did not validate against our published schema.\"", description_cn: '当用户为配置发送格式错误的XML（不符合发布的XSD的XML）时，就会发生这种情况。错误消息是：“您提供的XML格式不正确，或者没有根据我们发布的模式进行验证。”' },
  { code: 'MaxMessageLengthExceeded', description: 'Your request was too big.', description_cn: '你的请求太大了。' },
  { code: 'MaxPostPreDataLengthExceededError', description: 'Your POST request fields preceding the upload file were too large.', description_cn: '上传文件之前的POST请求字段太大。' },
  { code: 'MetadataTooLarge', description: 'Your metadata headers exceed the maximum allowed metadata size.', description_cn: '元数据标头超过了允许的最大元数据大小。' },
  { code: 'MethodNotAllowed', description: 'The specified method is not allowed against this resource.', description_cn: '不允许对此资源使用指定的方法。' },
  { code: 'MissingAttachment', description: 'A SOAP attachment was expected, but none were found.', description_cn: '应为SOAP附件，但未找到任何附件。' },
  { code: 'MissingContentLength', description: 'You must provide the Content-Length HTTP header.', description_cn: '您必须提供内容长度HTTP标头。' },
  { code: 'MissingRequestBodyError', description: 'This happens when the user sends an empty XML document as a request. The error message is, "Request body is empty."', description_cn: '当用户发送一个空的XML文档作为请求时，就会发生这种情况。错误消息是：“请求正文为空。”' },
  { code: 'MissingSecurityElement', description: 'The SOAP 1.1 request is missing a security element.', description_cn: 'SOAP 1.1请求缺少安全元素。' },
  { code: 'MissingSecurityHeader', description: 'Your request is missing a required header.', description_cn: '您的请求缺少必需的标题。' },
  { code: 'NotFoundObject', description: 'can not find the object in userStore,please check', description_cn: '在当前用户存储桶中找不到该对象，请检查' },
  { code: 'NoLoggingStatusForKey', description: 'There is no such thing as a logging status subresource for a key.', description_cn: '没有键的日志状态子资源。' },
  { code: 'NoSuchBucket', description: 'The specified bucket does not exist.', description_cn: '指定的存储桶不存在。' },
  { code: 'NoSuchBucketPolicy', description: 'The specified bucket does not have a bucket policy.', description_cn: '指定的存储桶没有存储桶策略。' },
  { code: 'NoSuchKey', description: 'The specified key does not exist.', description_cn: '指定的密钥不存在。' },
  { code: 'NoSuchLifecycleConfiguration', description: 'The lifecycle configuration does not exist.', description_cn: '生命周期配置不存在。' },
  { code: 'NoSuchUpload', description: 'The specified multipart upload does not exist. The upload ID might be invalid, or the multipart upload might have been aborted or completed.', description_cn: '指定的多部分上载不存在。上载ID可能无效，或者多部分上载可能已中止或完成。' },
  { code: 'NoSuchVersion', description: 'Indicates that the version ID specified in the request does not match an existing version.', description_cn: '指示请求中指定的版本ID与现有版本不匹配。' },
  { code: 'NotImplemented', description: 'A header you provided implies functionality that is not implemented.', description_cn: '您提供的标题意味着未实现的功能。' },
  { code: 'NotSignedUp', description: 'Your account is not signed up for the Amazon S3 service. You must sign up before you can use Amazon S3. You can sign up at the following URL: Amazon S3', description_cn: '您的帐户未注册亚马逊S3服务。你必须先注册才能使用Amazon S3。您可以在以下URL注册：Amazon S3' },
  { code: 'OperationAborted', description: 'A conflicting conditional action is currently in progress against this resource. Try again.', description_cn: '当前正在对此资源执行冲突的条件操作。再试一次。' },
  { code: 'PermanentRedirect', description: 'The bucket you are attempting to access must be addressed using the specified endpoint. Send all future requests to this endpoint.', description_cn: '您试图访问的存储桶必须使用指定的端点进行寻址。将所有未来的请求发送到此终结点。' },
  { code: 'PreconditionFailed', description: 'At least one of the preconditions you specified did not hold.', description_cn: '您指定的前提条件中至少有一个不成立。' },
  { code: 'Retention', description_cn: '该对象已有保留配置' },
  { code: 'Redirect', description: 'Temporary redirect.', description_cn: '临时重定向。' },
  { code: 'RestoreAlreadyInProgress', description: 'Object restore is already in progress.', description_cn: '对象还原已在进行中。' },
  { code: 'RequestIsNotMultiPartContent', description: 'Bucket POST must be of the enclosure-type multipart/form-data.', description_cn: '斗杆必须是外壳类型的多部分/表格数据。' },
  { code: 'RequestTimeout', description: 'Your socket connection to the server was not read from or written to within the timeout period.', description_cn: '您与服务器的套接字连接在超时期间未被读取或写入。' },
  { code: 'RequestTimeTooSkewed', description: "The difference between the request time and the server's time is too large.", description_cn: '请求时间和服务器时间之间的差异太大。' },
  { code: 'RequestTorrentOfBucketError', description: 'Requesting the torrent file of a bucket is not permitted.', description_cn: '不允许请求bucket的torrent文件。' },
  { code: 'SignatureDoesNotMatch', description: 'The request signature we calculated does not match the signature you provided. Check your Amazon Web Services secret access key and signing method. For more information, see REST Authentication and SOAP Authentication for details.', description_cn: '我们计算的请求签名与您提供的签名不匹配。检查您的Amazon Web Services秘密访问密钥和签名方法。有关详细信息，请参阅REST身份验证和SOAP身份验证。' },
  { code: 'ServiceUnavailable', description: 'Reduce your request rate.', description_cn: '降低您的请求率。' },
  { code: 'SlowDown', description: 'Reduce your request rate.', description_cn: '降低您的请求率。' },
  { code: 'TemporaryRedirect', description: 'You are being redirected to the bucket while DNS updates.', description_cn: 'DNS更新时，您被重定向到bucket。' },
  { code: 'TokenRefreshRequired', description: 'The provided token must be refreshed.', description_cn: '必须刷新提供的令牌。' },
  { code: 'TooManyBuckets', description: 'You have attempted to create more buckets than allowed.', description_cn: '您试图创建的桶数超过了允许的数量。' },
  { code: 'UnexpectedContent', description: 'This request does not support content.', description_cn: '此请求不支持内容。' },
  { code: 'UnresolvableGrantByEmailAddress', description: 'The email address you provided does not match any account on record.', description_cn: '您提供的电子邮件地址与记录中的任何帐户都不匹配。' },
  { code: 'UserKeyMustBeSpecified', description: 'The bucket POST must contain the specified field name. If it is specified, check the order of the fields.', description_cn: 'bucket POST必须包含指定的字段名。如果已指定，请检查字段的顺序。' },
  { code: 'ErrRulePrefixConflict', description_cn: '当前规则的前缀与其他规则前缀有重叠部分，请更改' },
  { code: 'InvalidRuleId', description_cn: '此生命周期规则名称已存在' },
  { code: 'NetworkingError', description_cn: 's3服务暂不可用,请稍后再试' }
]
