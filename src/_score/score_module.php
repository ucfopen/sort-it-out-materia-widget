<?php
/**
 * Materia
 *
 * @package	    Materia
 * @version    1.0
 * @author     UCF New Media
 * @copyright  2011 New Media
 * @link       http://kogneato.com
 */


/**
 * NEEDS DOCUMENTATION
 *
 * The widget managers for the Materia package.
 *
 * @package	    Main
 * @subpackage  scoring
 * @category    Modules
 * @author      Nathan Dabu
 */

namespace Materia;

class Score_Modules_SortItOut extends Score_Module
{
	public function check_answer($log)
	{
		$answers = $this->questions[$log->item_id]->answers;
		foreach($answers as $answer)
		{
			// ensure string values are in parity. The answer value (coming from the qset) may include html entities.
			$log_sanitized = html_entity_decode(strtolower(trim($log->text)));
			$answer_sanitized = html_entity_decode(strtolower(trim($answer['text'])));

			if ($log_sanitized == $answer_sanitized)
			{
				return $answer['value'];
			}
		}
		return 0;
	}
}
